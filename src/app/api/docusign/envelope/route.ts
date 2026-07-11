import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { getESignProvider, eSignProviderName } from "@/lib/docusign";
import {
  renderAgreementHtml,
  renderAgentAuthHtml,
  computeCancelByDate,
} from "@/lib/engagement";
import { getCounty } from "@/lib/nm/counties";

const schema = z.object({ caseId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const kase = await db.case.findUnique({
    where: { id: parsed.data.caseId },
    include: { client: true, property: true, agreement: true },
  });
  if (!kase) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }
  if (kase.agreement && kase.agreement.status === "completed") {
    return NextResponse.json({ error: "already_signed" }, { status: 409 });
  }

  const ip = getClientIp(req);
  const county = getCounty(kase.countyId);
  const clientName = `${kase.client.firstName} ${kase.client.lastName}`;
  const effectiveDate = new Date();

  // The signing packet: services agreement + county agent authorization.
  const servicesHtml = renderAgreementHtml({
    clientName,
    feePercent: 30,
    arbitrationUpliftPercent: 10,
    taxYear: kase.taxYear,
    effectiveDate,
    properties: [
      { address: kase.property.situsAddress, ownerName: kase.property.ownerName },
    ],
  });
  const agentAuthHtml = renderAgentAuthHtml({
    ownerName: kase.property.ownerName,
    ownerMailingAddress: kase.client.mailingAddress,
    propertyAddress: kase.property.situsAddress,
    upc: kase.property.upc,
    countyName: county?.name ?? kase.countyId,
    assessorOffice: county?.assessor?.office ?? `${kase.countyId} Assessor`,
    taxYear: kase.taxYear,
    effectiveDate,
    sourceUrl: county?.forms?.agentAuthorizationUrl,
  });

  const docSpecs = [
    {
      kind: "services_agreement",
      name: `Property Tax Services Agreement (${kase.taxYear})`,
      html: servicesHtml,
      order: 0,
      sourceUrl: null as string | null,
    },
    {
      kind: "agent_authorization",
      name: `Agent Authorization — ${county?.name ?? kase.countyId} (${kase.taxYear})`,
      html: agentAuthHtml,
      order: 1,
      sourceUrl: county?.forms?.agentAuthorizationUrl ?? null,
    },
  ];

  const agreement =
    kase.agreement ??
    (await db.engagementAgreement.create({
      data: {
        clientId: kase.clientId,
        taxYear: kase.taxYear,
        feePercent: 30,
        arbitrationUpliftPercent: 10,
        provider: eSignProviderName(),
        status: "draft",
        effectiveDate,
        cancelByDate: computeCancelByDate(kase.taxYear),
      },
    }));

  // Refresh the document snapshots for this (re)send.
  await db.signedDocument.deleteMany({ where: { agreementId: agreement.id } });
  await db.signedDocument.createMany({
    data: docSpecs.map((d) => ({
      agreementId: agreement.id,
      kind: d.kind,
      name: d.name,
      html: d.html,
      order: d.order,
      sourceUrl: d.sourceUrl,
    })),
  });

  if (kase.agreementId !== agreement.id) {
    await db.case.update({
      where: { id: kase.id },
      data: { agreementId: agreement.id },
    });
  }

  const provider = getESignProvider();
  const result = await provider.createEnvelope({
    agreementId: agreement.id,
    signerName: clientName,
    signerEmail: kase.client.email,
    documents: docSpecs.map((d) => ({ name: d.name, html: d.html })),
    requestIp: ip,
    returnUrl: `${process.env.APP_BASE_URL ?? ""}/agreement/${agreement.id}/done`,
  });

  await db.engagementAgreement.update({
    where: { id: agreement.id },
    data: {
      provider: result.provider,
      status: "sent",
      envelopeId: result.envelopeId,
      requestIp: ip,
      sentAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      entityType: "EngagementAgreement",
      entityId: agreement.id,
      action: "envelope_sent",
      ip,
      meta: JSON.stringify({
        provider: result.provider,
        envelopeId: result.envelopeId,
        documents: docSpecs.map((d) => d.kind),
      }),
    },
  });

  return NextResponse.json({ signingUrl: result.signingUrl });
}
