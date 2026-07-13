import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOperator } from "@/lib/admin-auth";
import { AdminBar } from "@/components/AdminBar";
import { StatusPill, DeadlineBadge, formatDate } from "@/components/status";
import { CopyButton } from "@/components/CopyButton";
import {
  CASE_STATUSES,
  CASE_STATUS_LABELS,
  CASE_TYPE_LABELS,
  CaseType,
  FILING_OUTCOMES,
  GROUNDS,
  GROUND_LABELS,
  Ground,
} from "@/lib/enums";
import { getCounty } from "@/lib/nm/counties";
import { computeRefundClaimDeadline } from "@/lib/nm/law";
import { computeSavings, formatUsd } from "@/lib/savings";
import { generatePetition } from "@/lib/petition";
import {
  saveCase,
  addEvidence,
  deleteEvidence,
  markFiled,
  recordOutcome,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function CaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;

  const kase = await db.case.findUnique({
    where: { id },
    include: {
      client: true,
      property: true,
      notice: true,
      agreement: true,
      evidence: { orderBy: { createdAt: "desc" } },
      filing: true,
    },
  });
  if (!kase) notFound();

  const county = getCounty(kase.countyId);
  const grounds: Ground[] = JSON.parse(kase.grounds || "[]");
  const millRate = kase.millRate ?? county?.defaultMillRate ?? 40;
  const feePercent = kase.agreement?.feePercent ?? 30;

  // Savings: use final value if resolved, else target value as an estimate.
  const compareValue = kase.finalAssessedValue ?? kase.targetValue ?? null;
  const savings =
    kase.initialAssessedValue && compareValue
      ? computeSavings({
          initialValue: kase.initialAssessedValue,
          finalValue: compareValue,
          millRate,
          feePercent,
        })
      : null;
  const savingsIsFinal = kase.finalAssessedValue != null;

  const petition = generatePetition({
    countyId: kase.countyId,
    taxYear: kase.taxYear,
    ownerName: kase.property.ownerName,
    situsAddress: kase.property.situsAddress,
    upc: kase.property.upc,
    mailingAddress: kase.client.mailingAddress,
    initialAssessedValue: kase.initialAssessedValue,
    targetValue: kase.targetValue,
    grounds,
  });

  const audit = await db.auditLog.findMany({
    where: {
      OR: [
        { entityType: "Case", entityId: kase.id },
        kase.agreement
          ? { entityType: "EngagementAgreement", entityId: kase.agreement.id }
          : { entityId: "__none__" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div>
      <AdminBar />
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/admin" className="text-sm text-ink-faint hover:text-ink">
          ← All cases
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl text-ink">
            {kase.client.firstName} {kase.client.lastName}
          </h1>
          <StatusPill status={kase.status} />
          {kase.caseType === "refund_claim" ? (
            <span className="pill bg-amber-100 text-amber-800">
              {CASE_TYPE_LABELS[kase.caseType as CaseType]}
            </span>
          ) : (
            <DeadlineBadge deadline={kase.protestDeadline} />
          )}
        </div>
        <p className="text-sm text-ink-soft">
          {kase.property.situsAddress} · {county?.name} · Tax year{" "}
          {kase.taxYear}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left / main workspace */}
          <div className="space-y-6 lg:col-span-2">
            {/* Working fields */}
            <form action={saveCase} className="card p-6">
              <input type="hidden" name="caseId" value={kase.id} />
              <h2 className="font-display text-lg text-ink">Case work</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Status</label>
                  <select
                    name="status"
                    defaultValue={kase.status}
                    className="field"
                  >
                    {CASE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {CASE_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Assigned to</label>
                  <input
                    name="assignedTo"
                    defaultValue={kase.assignedTo ?? ""}
                    className="field"
                    placeholder="operator"
                  />
                </div>
                <div>
                  <label className="label">Target value ($)</label>
                  <input
                    name="targetValue"
                    defaultValue={kase.targetValue ?? ""}
                    className="field"
                    inputMode="numeric"
                    placeholder="315000"
                  />
                </div>
                <div>
                  <label className="label">Mill rate (per $1,000 net)</label>
                  <input
                    name="millRate"
                    defaultValue={kase.millRate ?? county?.defaultMillRate ?? ""}
                    className="field"
                    inputMode="decimal"
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Grounds</label>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {GROUNDS.map((g) => (
                    <label key={g} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="grounds"
                        value={g}
                        defaultChecked={grounds.includes(g)}
                      />
                      <span className="text-ink-soft">{GROUND_LABELS[g]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={kase.notes ?? ""}
                  rows={3}
                  className="field"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button className="btn-primary">Save</button>
              </div>
            </form>

            {/* Evidence / comps */}
            <div className="card p-6">
              <h2 className="font-display text-lg text-ink">
                Comparable sales & evidence
              </h2>
              {kase.evidence.length === 0 ? (
                <p className="mt-2 text-sm text-ink-faint">
                  No comps yet. Add sales that support a lower value.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-ink/5">
                  {kase.evidence.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-ink">{e.label}</span>
                        {e.value != null && (
                          <span className="ml-2 text-ink-soft">
                            {formatUsd(e.value)}
                          </span>
                        )}
                        {e.description && (
                          <span className="block text-xs text-ink-faint">
                            {e.description}
                          </span>
                        )}
                      </div>
                      <form action={deleteEvidence}>
                        <input type="hidden" name="evidenceId" value={e.id} />
                        <input type="hidden" name="caseId" value={kase.id} />
                        <button className="text-xs text-ink-faint hover:text-red-600">
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              <form
                action={addEvidence}
                className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto]"
              >
                <input type="hidden" name="caseId" value={kase.id} />
                <input
                  name="compAddress"
                  className="field"
                  placeholder="Comp address"
                />
                <input
                  name="compValue"
                  className="field"
                  inputMode="numeric"
                  placeholder="Sale $"
                />
                <button className="btn-ghost">Add comp</button>
                <input
                  name="compNote"
                  className="field sm:col-span-3"
                  placeholder="Note (sqft, sale date, condition…)"
                />
              </form>
            </div>

            {/* Petition */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">
                  Protest petition
                </h2>
                <CopyButton text={petition} label="Copy petition" />
              </div>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-sand-100/70 p-4 text-xs leading-relaxed text-ink">
                {petition}
              </pre>
              <form action={markFiled} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="caseId" value={kase.id} />
                <div>
                  <label className="label">Filing method</label>
                  <select name="method" className="field" defaultValue="mail">
                    <option value="mail">Mail</option>
                    <option value="in_person">In person</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="label">Confirmation #</label>
                  <input name="confirmationNumber" className="field" />
                </div>
                <button className="btn-primary">
                  {kase.filing?.filedAt ? "Update filing" : "Mark as filed"}
                </button>
                {kase.filing?.filedAt && (
                  <span className="text-xs text-ink-faint">
                    Filed {formatDate(kase.filing.filedAt)}
                  </span>
                )}
              </form>
            </div>

            {/* Outcome */}
            <div className="card p-6">
              <h2 className="font-display text-lg text-ink">Outcome</h2>
              <form
                action={recordOutcome}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="caseId" value={kase.id} />
                <div>
                  <label className="label">Result</label>
                  <select
                    name="outcome"
                    className="field"
                    defaultValue={kase.filing?.outcome ?? "pending"}
                  >
                    {FILING_OUTCOMES.map((o) => (
                      <option key={o} value={o}>
                        {o.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Final value ($)</label>
                  <input
                    name="finalValue"
                    className="field"
                    inputMode="numeric"
                    defaultValue={kase.finalAssessedValue ?? ""}
                  />
                </div>
                <button className="btn-primary">Record outcome</button>
              </form>
            </div>
          </div>

          {/* Right / summary rail */}
          <div className="space-y-6">
            {/* Savings */}
            <div className="card p-6">
              <h2 className="font-display text-lg text-ink">
                {savingsIsFinal ? "Savings" : "Estimated savings"}
              </h2>
              {savings ? (
                <dl className="mt-3 space-y-2 text-sm">
                  <Row label="Value reduction" value={formatUsd(savings.valueReduction)} />
                  <Row label="Tax savings" value={formatUsd(savings.taxSavings)} strong />
                  <Row
                    label={`Our fee (${savings.feePercent}%)`}
                    value={formatUsd(savings.fee)}
                  />
                  <Row label="Client keeps" value={formatUsd(savings.clientNet)} strong />
                </dl>
              ) : (
                <p className="mt-2 text-sm text-ink-faint">
                  Set a target value to estimate savings.
                </p>
              )}
              <p className="mt-3 text-xs text-ink-faint">
                Estimate uses NM&apos;s 1/3 assessment ratio and a mill rate of{" "}
                {millRate}. Verify the property&apos;s actual tax-district rate.
              </p>
            </div>

            {/* Client */}
            <div className="card p-6 text-sm">
              <h2 className="font-display text-lg text-ink">Client</h2>
              <div className="mt-3 space-y-1 text-ink-soft">
                <p>{kase.client.email}</p>
                {kase.client.phone && <p>{kase.client.phone}</p>}
                {kase.client.mailingAddress && (
                  <p>{kase.client.mailingAddress}</p>
                )}
                {kase.client.signupIp && (
                  <p className="text-xs text-ink-faint">
                    Signup IP {kase.client.signupIp}
                  </p>
                )}
              </div>
            </div>

            {/* Notice of Value */}
            <div className="card p-6 text-sm">
              <h2 className="font-display text-lg text-ink">Notice of Value</h2>
              <dl className="mt-3 space-y-2">
                <Row label="Full value" value={formatUsd(kase.notice?.fullValue ?? kase.initialAssessedValue)} />
                <Row label="Mailed" value={formatDate(kase.notice?.mailingDate)} />
                <Row label="Protest due" value={formatDate(kase.protestDeadline)} />
                {kase.property.upc && (
                  <Row label={county?.parcelIdLabel ?? "Parcel"} value={kase.property.upc} />
                )}
              </dl>
            </div>

            {/* County process + official forms */}
            <div className="card p-6 text-sm">
              <h2 className="font-display text-lg text-ink">
                {county?.name ?? "County"} process
              </h2>
              <div className="mt-3 space-y-1.5 text-ink-soft">
                {county?.assessor?.office && <p>{county.assessor.office}</p>}
                {county?.assessor?.phone && <p>{county.assessor.phone}</p>}
                {county?.assessor?.email && <p>{county.assessor.email}</p>}
                {county?.protestFilingWindowNote && (
                  <p className="text-xs text-ink-faint">
                    {county.protestFilingWindowNote}
                  </p>
                )}
                {county?.onlineProtestNote && (
                  <p className="text-xs text-ink-faint">
                    {county.onlineProtestNote}
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-1">
                {county?.assessor?.appealPortalUrl && (
                  <FormLink
                    url={county.assessor.appealPortalUrl}
                    label="Online appeal portal"
                  />
                )}
                {county?.assessor?.propertySearchUrl && (
                  <FormLink
                    url={county.assessor.propertySearchUrl}
                    label="Property / UPC search"
                  />
                )}
                {county?.forms?.protestFormUrl && (
                  <FormLink url={county.forms.protestFormUrl} label="Protest form" />
                )}
                {county?.forms?.agentAuthorizationUrl && (
                  <FormLink
                    url={county.forms.agentAuthorizationUrl}
                    label="Agent authorization"
                  />
                )}
                {county?.forms?.pamphletUrl && (
                  <FormLink url={county.forms.pamphletUrl} label="Protest pamphlet" />
                )}
                {county?.forms?.helpGuideUrl && (
                  <FormLink url={county.forms.helpGuideUrl} label="Help guide" />
                )}
                {county?.forms?.residentialInfoUrl && (
                  <FormLink
                    url={county.forms.residentialInfoUrl}
                    label="Residential owner info"
                  />
                )}
              </div>
            </div>

            {/* Hearing schedule & validation reference */}
            {county?.reference && (
              <div className="card p-6 text-sm">
                <h2 className="font-display text-lg text-ink">
                  Hearing schedule &amp; reference
                </h2>
                {county.reference.resolutionNote && (
                  <p className="mt-3 text-ink-soft">
                    {county.reference.resolutionNote}
                  </p>
                )}
                {county.reference.massAppraisalNote && (
                  <p className="mt-2 text-ink-soft">
                    {county.reference.massAppraisalNote}
                  </p>
                )}
                {county.reference.hearingSchedule &&
                  county.reference.hearingSchedule.length > 0 && (
                    <>
                      <p className="label mt-4">Typical hearing windows</p>
                      <ul className="space-y-1.5 text-ink-soft">
                        {county.reference.hearingSchedule.map((h, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-clay">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                {county.reference.legalBasis && (
                  <p className="mt-4 border-t border-ink/10 pt-3 text-xs text-ink-faint">
                    {county.reference.legalBasis}
                  </p>
                )}
              </div>
            )}

            {/* Claim for refund (missed-deadline path) */}
            {(kase.caseType === "refund_claim" || county?.refundClaim) && (
              <div
                className={`card p-6 text-sm ${
                  kase.caseType === "refund_claim"
                    ? "border-amber-300 bg-amber-50/60"
                    : ""
                }`}
              >
                <h2 className="font-display text-lg text-ink">Claim for refund</h2>
                {kase.caseType === "refund_claim" ? (
                  <p className="mt-2 text-ink-soft">
                    Protest window missed — this case runs as a District Court
                    claim for refund.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-ink-faint">
                    Fallback path if the 30-day protest window is missed.
                  </p>
                )}
                {county?.refundClaim && (
                  <dl className="mt-3 space-y-2">
                    <Row label="Court" value={county.refundClaim.court} />
                    {county.refundClaim.address && (
                      <Row label="Where" value={county.refundClaim.address} />
                    )}
                    {county.refundClaim.room && (
                      <Row label="Room" value={county.refundClaim.room} />
                    )}
                    <Row
                      label="Deadline"
                      value={formatDate(computeRefundClaimDeadline(kase.taxYear))}
                    />
                    {county.refundClaim.filingFee && (
                      <Row label="Filing fee" value={county.refundClaim.filingFee} />
                    )}
                  </dl>
                )}
                {county?.refundClaim?.paymentNote && (
                  <p className="mt-2 text-xs text-ink-faint">
                    {county.refundClaim.paymentNote}
                  </p>
                )}
                {county?.refundClaim?.forms &&
                  county.refundClaim.forms.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1">
                      {county.refundClaim.forms.map((fl) => (
                        <FormLink key={fl.url} url={fl.url} label={fl.label} />
                      ))}
                    </div>
                  )}
                {county?.refundClaim?.selfHelp && (
                  <p className="mt-2 text-xs text-ink-faint">
                    {county.refundClaim.selfHelp}
                  </p>
                )}
              </div>
            )}

            {/* Agreement */}
            <div className="card p-6 text-sm">
              <h2 className="font-display text-lg text-ink">Agreement</h2>
              {kase.agreement ? (
                <dl className="mt-3 space-y-2">
                  <Row
                    label="Status"
                    value={
                      <span className="capitalize">{kase.agreement.status}</span>
                    }
                  />
                  <Row label="Provider" value={kase.agreement.provider} />
                  <Row label="Fee" value={`${kase.agreement.feePercent}%`} />
                  <Row label="Signed" value={formatDate(kase.agreement.completedAt)} />
                  {kase.agreement.signerIp && (
                    <Row label="Signer IP" value={kase.agreement.signerIp} />
                  )}
                  {kase.agreement.envelopeId && (
                    <Row label="Envelope" value={kase.agreement.envelopeId} />
                  )}
                </dl>
              ) : (
                <p className="mt-2 text-ink-faint">
                  Not engaged yet — no agreement on file.
                </p>
              )}
            </div>

            {/* Audit */}
            <div className="card p-6 text-sm">
              <h2 className="font-display text-lg text-ink">Activity</h2>
              <ul className="mt-3 space-y-2">
                {audit.map((a) => (
                  <li key={a.id} className="text-ink-soft">
                    <span className="text-ink">{a.action.replace(/_/g, " ")}</span>
                    <span className="block text-xs text-ink-faint">
                      {formatDate(a.createdAt)}
                      {a.ip ? ` · ${a.ip}` : ""}
                    </span>
                  </li>
                ))}
                {audit.length === 0 && (
                  <li className="text-ink-faint">No activity yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FormLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-clay hover:text-clay-dark"
    >
      {label} ↗
    </a>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={strong ? "font-semibold text-ink" : "text-ink-soft"}>
        {value}
      </dd>
    </div>
  );
}
