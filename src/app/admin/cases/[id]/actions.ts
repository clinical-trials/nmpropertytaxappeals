"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOperator } from "@/lib/admin-auth";
import { CASE_STATUSES, FILING_OUTCOMES, GROUNDS } from "@/lib/enums";
import { generatePetition } from "@/lib/petition";
import { generateRefundComplaint } from "@/lib/complaint";
import { getCounty } from "@/lib/nm/counties";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}
function float(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}
function str(v: FormDataEntryValue | null): string | null {
  const s = v == null ? "" : String(v).trim();
  return s.length ? s : null;
}
function revalidate(id: string) {
  revalidatePath(`/admin/cases/${id}`);
  revalidatePath("/admin");
}

export async function saveCase(formData: FormData) {
  await requireOperator();
  const id = String(formData.get("caseId"));
  const status = String(formData.get("status") ?? "");
  const grounds = formData.getAll("grounds").map(String).filter((g) => GROUNDS.includes(g as any));

  await db.case.update({
    where: { id },
    data: {
      status: CASE_STATUSES.includes(status as any) ? status : undefined,
      targetValue: num(formData.get("targetValue")),
      millRate: float(formData.get("millRate")),
      assignedTo: str(formData.get("assignedTo")),
      notes: str(formData.get("notes")),
      grounds: JSON.stringify(grounds),
    },
  });
  await db.auditLog.create({
    data: { entityType: "Case", entityId: id, action: "case_updated" },
  });
  revalidate(id);
}

export async function addEvidence(formData: FormData) {
  await requireOperator();
  const caseId = String(formData.get("caseId"));
  const address = str(formData.get("compAddress"));
  const value = num(formData.get("compValue"));
  const note = str(formData.get("compNote"));

  await db.evidence.create({
    data: {
      caseId,
      kind: "comp",
      label: address ?? "Comparable sale",
      description: note,
      value,
      data: JSON.stringify({ address }),
    },
  });
  revalidate(caseId);
}

export async function deleteEvidence(formData: FormData) {
  await requireOperator();
  const id = String(formData.get("evidenceId"));
  const caseId = String(formData.get("caseId"));
  await db.evidence.delete({ where: { id } });
  revalidate(caseId);
}

export async function markFiled(formData: FormData) {
  await requireOperator();
  const caseId = String(formData.get("caseId"));
  const kase = await db.case.findUnique({
    where: { id: caseId },
    include: { client: true, property: true },
  });
  if (!kase) return;

  const petitionText =
    kase.caseType === "refund_claim"
      ? generateRefundComplaint({
          countyId: kase.countyId,
          taxYear: kase.taxYear,
          ownerName: kase.property.ownerName,
          ownerMailingAddress: kase.client.mailingAddress,
          situsAddress: kase.property.situsAddress,
          upc: kase.property.upc,
          initialAssessedValue: kase.initialAssessedValue,
          targetValue: kase.targetValue,
        })
      : generatePetition({
          countyId: kase.countyId,
          taxYear: kase.taxYear,
          ownerName: kase.property.ownerName,
          situsAddress: kase.property.situsAddress,
          upc: kase.property.upc,
          mailingAddress: kase.client.mailingAddress,
          initialAssessedValue: kase.initialAssessedValue,
          targetValue: kase.targetValue,
          grounds: JSON.parse(kase.grounds || "[]"),
        });

  const method = String(formData.get("method") || "mail");
  const confirmationNumber = str(formData.get("confirmationNumber"));

  await db.filing.upsert({
    where: { caseId },
    create: {
      caseId,
      method,
      petitionText,
      filedAt: new Date(),
      confirmationNumber,
      outcome: "pending",
    },
    update: {
      method,
      petitionText,
      filedAt: new Date(),
      confirmationNumber,
    },
  });
  await db.case.update({ where: { id: caseId }, data: { status: "filed" } });
  await db.auditLog.create({
    data: { entityType: "Case", entityId: caseId, action: "protest_filed" },
  });
  revalidate(caseId);
}

export async function recordOutcome(formData: FormData) {
  await requireOperator();
  const caseId = String(formData.get("caseId"));
  const outcome = String(formData.get("outcome"));
  const finalValue = num(formData.get("finalValue"));
  if (!FILING_OUTCOMES.includes(outcome as any)) return;

  await db.filing.upsert({
    where: { caseId },
    create: { caseId, outcome, finalValue, decidedAt: new Date() },
    update: { outcome, finalValue, decidedAt: new Date() },
  });
  await db.case.update({
    where: { id: caseId },
    data: { finalAssessedValue: finalValue, status: "resolved" },
  });
  await db.auditLog.create({
    data: {
      entityType: "Case",
      entityId: caseId,
      action: "outcome_recorded",
      meta: JSON.stringify({ outcome, finalValue }),
    },
  });
  revalidate(caseId);
}
