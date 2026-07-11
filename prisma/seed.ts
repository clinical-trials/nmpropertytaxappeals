import { PrismaClient } from "@prisma/client";
import { computeProtestDeadline } from "../src/lib/nm/law";
import {
  computeCancelByDate,
  renderAgreementHtml,
  renderAgentAuthHtml,
} from "../src/lib/engagement";
import { getCounty } from "../src/lib/nm/counties";

const db = new PrismaClient();

async function main() {
  // Clear (dev only).
  await db.auditLog.deleteMany();
  await db.filing.deleteMany();
  await db.evidence.deleteMany();
  await db.case.deleteMany();
  await db.noticeOfValue.deleteMany();
  await db.engagementAgreement.deleteMany();
  await db.property.deleteMany();
  await db.client.deleteMany();

  const taxYear = new Date().getFullYear();
  const mailed = new Date(taxYear, 3, 1); // April 1
  const deadline = computeProtestDeadline(mailed);

  // --- Case 1: engaged, strong over-valuation (recent purchase) ---
  const c1 = await db.client.create({
    data: {
      firstName: "Rosa",
      lastName: "Trujillo",
      email: "rosa.trujillo@example.com",
      phone: "(505) 555-0142",
      mailingAddress: "128 Palomas Dr NE, Albuquerque, NM 87108",
      signupIp: "73.12.44.9",
    },
  });
  const p1 = await db.property.create({
    data: {
      clientId: c1.id,
      countyId: "bernalillo",
      situsAddress: "128 Palomas Dr NE, Albuquerque, NM 87108",
      ownerName: "Rosa Trujillo",
      upc: "101405######10230",
      propertyClass: "residential",
      yearBuilt: 1962,
      squareFeet: 1480,
      purchasePrice: 312000,
      purchaseDate: new Date(taxYear - 1, 6, 15),
    },
  });
  const nov1 = await db.noticeOfValue.create({
    data: {
      propertyId: p1.id,
      taxYear,
      fullValue: 361000,
      mailingDate: mailed,
      protestDeadline: deadline,
    },
  });
  const bern = getCounty("bernalillo");
  const eff1 = new Date(taxYear, 3, 10);
  const html1 = renderAgreementHtml({
    clientName: "Rosa Trujillo",
    feePercent: 30,
    arbitrationUpliftPercent: 10,
    taxYear,
    effectiveDate: eff1,
    properties: [{ address: p1.situsAddress, ownerName: p1.ownerName }],
  });
  const agentAuth1 = renderAgentAuthHtml({
    ownerName: p1.ownerName,
    ownerMailingAddress: c1.mailingAddress,
    propertyAddress: p1.situsAddress,
    upc: p1.upc,
    countyName: bern?.name ?? "Bernalillo County",
    assessorOffice: bern?.assessor?.office ?? "Bernalillo County Assessor",
    taxYear,
    effectiveDate: eff1,
    sourceUrl: bern?.forms?.agentAuthorizationUrl,
  });
  const a1 = await db.engagementAgreement.create({
    data: {
      clientId: c1.id,
      taxYear,
      feePercent: 30,
      provider: "mock",
      status: "completed",
      envelopeId: "mock-seed-0001",
      signerIp: "73.12.44.9",
      requestIp: "73.12.44.9",
      effectiveDate: eff1,
      completedAt: eff1,
      cancelByDate: computeCancelByDate(taxYear),
      documents: {
        create: [
          {
            kind: "services_agreement",
            name: `Property Tax Services Agreement (${taxYear})`,
            html: html1,
            order: 0,
          },
          {
            kind: "agent_authorization",
            name: `Agent Authorization — Bernalillo County (${taxYear})`,
            html: agentAuth1,
            order: 1,
            sourceUrl: bern?.forms?.agentAuthorizationUrl ?? null,
          },
        ],
      },
    },
  });
  await db.case.create({
    data: {
      clientId: c1.id,
      propertyId: p1.id,
      noticeId: nov1.id,
      agreementId: a1.id,
      countyId: "bernalillo",
      taxYear,
      status: "engaged",
      grounds: JSON.stringify(["over_valuation"]),
      protestDeadline: deadline,
      initialAssessedValue: 361000,
      targetValue: 315000,
      millRate: 40,
      assignedTo: "operator",
      notes: "Bought 07/last year at $312k; NOV $361k. Strong recent-sale comp.",
    },
  });

  // --- Case 2: new intake, needs review ---
  const c2 = await db.client.create({
    data: {
      firstName: "Daniel",
      lastName: "Ortega",
      email: "d.ortega@example.com",
      phone: "(505) 555-0177",
      mailingAddress: "5510 Guadalupe Trl NW, Los Ranchos, NM 87107",
      signupIp: "68.44.201.3",
    },
  });
  const p2 = await db.property.create({
    data: {
      clientId: c2.id,
      countyId: "bernalillo",
      situsAddress: "5510 Guadalupe Trl NW, Los Ranchos, NM 87107",
      ownerName: "Daniel Ortega",
      propertyClass: "residential",
      yearBuilt: 1988,
      squareFeet: 2210,
    },
  });
  const nov2 = await db.noticeOfValue.create({
    data: {
      propertyId: p2.id,
      taxYear,
      fullValue: 498000,
      mailingDate: mailed,
      protestDeadline: deadline,
    },
  });
  await db.case.create({
    data: {
      clientId: c2.id,
      propertyId: p2.id,
      noticeId: nov2.id,
      countyId: "bernalillo",
      taxYear,
      status: "intake",
      grounds: JSON.stringify(["valuation_cap"]),
      protestDeadline: deadline,
      initialAssessedValue: 498000,
      millRate: 40,
      notes: "Reports value jumped ~9% over last year. Check 3% cap eligibility.",
    },
  });

  console.log("Seeded 2 clients, 2 properties, 2 cases.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
