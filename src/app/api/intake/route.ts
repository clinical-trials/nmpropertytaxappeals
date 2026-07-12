import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/ip";
import { isSupported } from "@/lib/nm/counties";
import { computeProtestDeadline } from "@/lib/nm/law";
import { evaluate } from "@/lib/nm/eligibility";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  countyId: z.string().min(1),
  situsAddress: z.string().min(3),
  ownerName: z.string().min(1),
  upc: z.string().optional(),
  mailingAddress: z.string().optional(),
  fullValue: z.number().int().positive(),
  priorYearValue: z.number().int().positive().nullable().optional(),
  mailingDate: z.string().optional(),
  protestDeadline: z.string().optional(),
  yearBuilt: z.number().int().nullable().optional(),
  squareFeet: z.number().int().nullable().optional(),
  purchasePrice: z.number().int().positive().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  hasConditionIssues: z.boolean().optional(),
  conditionNotes: z.string().optional(),
  qualifiesHeadOfFamily: z.boolean().optional(),
  qualifiesVeteran: z.boolean().optional(),
  qualifiesDisabledVeteran: z.boolean().optional(),
  qualifiesValuationFreeze: z.boolean().optional(),
  claimsExemptionAlready: z.boolean().optional(),
});

function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (!isSupported(d.countyId)) {
    return NextResponse.json(
      { error: "county_unsupported" },
      { status: 422 }
    );
  }

  // Determine protest deadline: prefer the printed deadline, else compute.
  const printedDeadline = parseDate(d.protestDeadline);
  const mailingDate = parseDate(d.mailingDate);
  const deadline =
    printedDeadline ??
    (mailingDate ? computeProtestDeadline(mailingDate) : null);
  if (!deadline) {
    return NextResponse.json(
      { error: "need_deadline_or_mailing_date" },
      { status: 400 }
    );
  }

  const taxYear = new Date().getFullYear();
  const purchaseDate = parseDate(d.purchaseDate);
  const ip = getClientIp(req);

  const client = await db.client.create({
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      mailingAddress: d.mailingAddress || d.situsAddress,
      signupIp: ip,
    },
  });

  const property = await db.property.create({
    data: {
      clientId: client.id,
      countyId: d.countyId,
      situsAddress: d.situsAddress,
      ownerName: d.ownerName,
      upc: d.upc || null,
      propertyClass: "residential",
      yearBuilt: d.yearBuilt ?? null,
      squareFeet: d.squareFeet ?? null,
      purchasePrice: d.purchasePrice ?? null,
      purchaseDate,
    },
  });

  const notice = await db.noticeOfValue.create({
    data: {
      propertyId: property.id,
      taxYear,
      fullValue: d.fullValue,
      mailingDate,
      protestDeadline: deadline,
    },
  });

  const eligibility = evaluate({
    fullValue: d.fullValue,
    taxYear,
    priorYearValue: d.priorYearValue ?? null,
    purchasePrice: d.purchasePrice ?? null,
    purchaseDate,
    hasConditionIssues: d.hasConditionIssues,
    qualifiesHeadOfFamily: d.qualifiesHeadOfFamily,
    qualifiesVeteran: d.qualifiesVeteran,
    qualifiesDisabledVeteran: d.qualifiesDisabledVeteran,
    qualifiesValuationFreeze: d.qualifiesValuationFreeze,
    claimsExemptionAlready: d.claimsExemptionAlready,
    protestDeadline: deadline,
  });

  const notesParts = [
    d.conditionNotes ? `Condition: ${d.conditionNotes}` : null,
    eligibility.flags.length
      ? `Auto-flags: ${eligibility.flags.map((f) => f.reason).join(" | ")}`
      : null,
  ].filter(Boolean);

  const kase = await db.case.create({
    data: {
      clientId: client.id,
      propertyId: property.id,
      noticeId: notice.id,
      countyId: d.countyId,
      taxYear,
      caseType: eligibility.track,
      status: "intake",
      grounds: JSON.stringify(eligibility.grounds),
      protestDeadline: deadline,
      initialAssessedValue: d.fullValue,
      notes: notesParts.join("\n") || null,
    },
  });

  await db.auditLog.create({
    data: {
      entityType: "Case",
      entityId: kase.id,
      action: "intake_submitted",
      ip,
      meta: JSON.stringify({ recommendation: eligibility.recommendation }),
    },
  });

  return NextResponse.json({
    caseId: kase.id,
    clientName: `${client.firstName} ${client.lastName}`,
    eligibility,
  });
}
