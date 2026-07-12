"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { COUNTIES, getCounty } from "@/lib/nm/counties";
import type { EligibilityResult } from "@/lib/nm/eligibility";
import { GROUND_LABELS, Ground } from "@/lib/enums";

type Form = {
  countyId: string;
  situsAddress: string;
  ownerName: string;
  upc: string;
  fullValue: string;
  priorYearValue: string;
  deadlineMode: "printed" | "mailing";
  protestDeadline: string;
  mailingDate: string;
  yearBuilt: string;
  squareFeet: string;
  purchasePrice: string;
  purchaseDate: string;
  hasConditionIssues: boolean;
  conditionNotes: string;
  qualifiesHeadOfFamily: boolean;
  qualifiesVeteran: boolean;
  qualifiesDisabledVeteran: boolean;
  qualifiesValuationFreeze: boolean;
  claimsExemptionAlready: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mailingAddress: string;
};

const EMPTY: Form = {
  countyId: "bernalillo",
  situsAddress: "",
  ownerName: "",
  upc: "",
  fullValue: "",
  priorYearValue: "",
  deadlineMode: "printed",
  protestDeadline: "",
  mailingDate: "",
  yearBuilt: "",
  squareFeet: "",
  purchasePrice: "",
  purchaseDate: "",
  hasConditionIssues: false,
  conditionNotes: "",
  qualifiesHeadOfFamily: false,
  qualifiesVeteran: false,
  qualifiesDisabledVeteran: false,
  qualifiesValuationFreeze: false,
  claimsExemptionAlready: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mailingAddress: "",
};

const STEPS = ["Property", "Notice of Value", "Your home", "Exemptions", "Contact"];

function toInt(s: string): number | null {
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { caseId: string; eligibility: EligibilityResult } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const county = getCounty(f.countyId);
  const countySupported = !!county?.supported;

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  const canNext = useMemo(() => {
    if (step === 0) return countySupported && f.situsAddress.length > 3 && f.ownerName.length > 0;
    if (step === 1) {
      const hasValue = toInt(f.fullValue) != null;
      const hasDeadline =
        f.deadlineMode === "printed" ? !!f.protestDeadline : !!f.mailingDate;
      return hasValue && hasDeadline;
    }
    if (step === 4)
      return f.firstName && f.lastName && /.+@.+\..+/.test(f.email);
    return true;
  }, [step, f, countySupported]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        firstName: f.firstName,
        lastName: f.lastName,
        email: f.email,
        phone: f.phone || undefined,
        countyId: f.countyId,
        situsAddress: f.situsAddress,
        ownerName: f.ownerName,
        upc: f.upc || undefined,
        mailingAddress: f.mailingAddress || undefined,
        fullValue: toInt(f.fullValue),
        priorYearValue: toInt(f.priorYearValue),
        protestDeadline:
          f.deadlineMode === "printed" ? f.protestDeadline || undefined : undefined,
        mailingDate:
          f.deadlineMode === "mailing" ? f.mailingDate || undefined : undefined,
        yearBuilt: toInt(f.yearBuilt),
        squareFeet: toInt(f.squareFeet),
        purchasePrice: toInt(f.purchasePrice),
        purchaseDate: f.purchaseDate || undefined,
        hasConditionIssues: f.hasConditionIssues,
        conditionNotes: f.conditionNotes || undefined,
        qualifiesHeadOfFamily: f.qualifiesHeadOfFamily,
        qualifiesVeteran: f.qualifiesVeteran,
        qualifiesDisabledVeteran: f.qualifiesDisabledVeteran,
        qualifiesValuationFreeze: f.qualifiesValuationFreeze,
        claimsExemptionAlready: f.claimsExemptionAlready,
      };
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      const data = await res.json();
      setResult({ caseId: data.caseId, eligibility: data.eligibility });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function proceedToSign() {
    if (!result) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/docusign/envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: result.caseId }),
      });
      if (!res.ok) throw new Error("Could not start the agreement. Please try again.");
      const data = await res.json();
      window.location.href = data.signingUrl;
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div>
        <SiteHeader cta={false} />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <ResultView
            eligibility={result.eligibility}
            onProceed={proceedToSign}
            submitting={submitting}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader cta={false} />
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-ink-faint">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-clay transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <Section
              title="Which property?"
              hint="We start with Bernalillo County. Other counties are opening soon."
            >
              <div>
                <label className="label">County</label>
                <select
                  className="field"
                  value={f.countyId}
                  onChange={(e) => set("countyId", e.target.value)}
                >
                  {COUNTIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                      {c.supported ? "" : " — coming soon"}
                    </option>
                  ))}
                </select>
              </div>
              {!countySupported && (
                <div className="rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm text-ink-soft">
                  We&apos;re not live in {county?.name} yet. Leave your email at
                  the end and we&apos;ll reach out when we open there.
                </div>
              )}
              <Text
                label="Property address"
                value={f.situsAddress}
                onChange={(v) => set("situsAddress", v)}
                placeholder="128 Palomas Dr NE, Albuquerque, NM 87108"
              />
              <Text
                label="Owner name (as on the tax record)"
                value={f.ownerName}
                onChange={(v) => set("ownerName", v)}
                placeholder="Rosa Trujillo"
              />
              <div>
                <label className="label">
                  UPC / parcel code{" "}
                  <span className="font-normal normal-case text-ink-faint">
                    (optional — we can look it up)
                  </span>
                </label>
                <input
                  className="field"
                  value={f.upc}
                  onChange={(e) => set("upc", e.target.value)}
                  placeholder="e.g. 101405123456710230"
                />
                <p className="mt-1.5 text-xs text-ink-faint">
                  The Uniform Parcel Code identifies your property on the tax
                  roll.{" "}
                  {county?.assessor?.propertySearchUrl && (
                    <a
                      href={county.assessor.propertySearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-clay hover:text-clay-dark"
                    >
                      Look it up by address ↗
                    </a>
                  )}{" "}
                  Leave it blank and we&apos;ll find it for you.
                </p>
              </div>
            </Section>
          )}

          {step === 1 && (
            <Section
              title="Your Notice of Value"
              hint="These numbers are on the notice the assessor mailed you this spring."
            >
              <Money
                label="Assessed (full) value on the notice"
                value={f.fullValue}
                onChange={(v) => set("fullValue", v)}
                placeholder="361,000"
              />
              <Money
                label="Last year's value (optional)"
                value={f.priorYearValue}
                onChange={(v) => set("priorYearValue", v)}
                placeholder="342,000"
              />
              <div>
                <label className="label">Protest deadline</label>
                <div className="mb-2 flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => set("deadlineMode", "printed")}
                    className={`pill border ${
                      f.deadlineMode === "printed"
                        ? "border-clay bg-clay/10 text-clay"
                        : "border-ink/15 text-ink-soft"
                    }`}
                  >
                    I have the printed deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => set("deadlineMode", "mailing")}
                    className={`pill border ${
                      f.deadlineMode === "mailing"
                        ? "border-clay bg-clay/10 text-clay"
                        : "border-ink/15 text-ink-soft"
                    }`}
                  >
                    I only know the mailing date
                  </button>
                </div>
                {f.deadlineMode === "printed" ? (
                  <input
                    type="date"
                    className="field"
                    value={f.protestDeadline}
                    onChange={(e) => set("protestDeadline", e.target.value)}
                  />
                ) : (
                  <input
                    type="date"
                    className="field"
                    value={f.mailingDate}
                    onChange={(e) => set("mailingDate", e.target.value)}
                  />
                )}
                <p className="mt-1.5 text-xs text-ink-faint">
                  In New Mexico you have 30 days from the mailing date to
                  protest.
                </p>
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section
              title="About the home"
              hint="Optional, but it helps us judge the case. A recent purchase price is especially useful."
            >
              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="Year built"
                  value={f.yearBuilt}
                  onChange={(v) => set("yearBuilt", v)}
                  placeholder="1962"
                />
                <Text
                  label="Square feet"
                  value={f.squareFeet}
                  onChange={(v) => set("squareFeet", v)}
                  placeholder="1,480"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Money
                  label="Recent purchase price"
                  value={f.purchasePrice}
                  onChange={(v) => set("purchasePrice", v)}
                  placeholder="312,000"
                />
                <div>
                  <label className="label">Purchase date</label>
                  <input
                    type="date"
                    className="field"
                    value={f.purchaseDate}
                    onChange={(e) => set("purchaseDate", e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={f.hasConditionIssues}
                  onChange={(e) => set("hasConditionIssues", e.target.checked)}
                />
                <span className="text-ink-soft">
                  My home has condition problems (foundation, roof, deferred
                  maintenance, etc.)
                </span>
              </label>
              {f.hasConditionIssues && (
                <textarea
                  className="field"
                  rows={3}
                  placeholder="Briefly describe the issues…"
                  value={f.conditionNotes}
                  onChange={(e) => set("conditionNotes", e.target.value)}
                />
              )}
            </Section>
          )}

          {step === 3 && (
            <Section
              title="Tax-saving programs"
              hint="These can cut your bill and are often left unclaimed. Check any that apply — we'll make sure they're captured."
            >
              <div className="space-y-3 rounded-xl border border-clay/30 bg-clay/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-clay">
                  Worth checking — real money
                </p>
                <Check
                  checked={f.qualifiesVeteran}
                  onChange={(v) => set("qualifiesVeteran", v)}
                  label="Veteran's exemption — I'm a veteran or surviving spouse"
                />
                <Check
                  checked={f.qualifiesDisabledVeteran}
                  onChange={(v) => set("qualifiesDisabledVeteran", v)}
                  label="Disabled veteran exemption — 100% service-connected disability"
                />
                <Check
                  checked={f.qualifiesValuationFreeze}
                  onChange={(v) => set("qualifiesValuationFreeze", v)}
                  label="Valuation freeze — I'm 65 or older (or disabled) and income-qualified"
                />
              </div>
              <Check
                checked={f.qualifiesHeadOfFamily}
                onChange={(v) => set("qualifiesHeadOfFamily", v)}
                label="Head of family — NM resident and head of my household"
              />
              <div className="my-2 border-t border-ink/10" />
              <Check
                checked={f.claimsExemptionAlready}
                onChange={(v) => set("claimsExemptionAlready", v)}
                label="These are already on my tax bill"
              />
            </Section>
          )}

          {step === 4 && (
            <Section
              title="Where can we reach you?"
              hint="We'll use this to send your agreement and case updates."
            >
              <div className="grid grid-cols-2 gap-4">
                <Text
                  label="First name"
                  value={f.firstName}
                  onChange={(v) => set("firstName", v)}
                />
                <Text
                  label="Last name"
                  value={f.lastName}
                  onChange={(v) => set("lastName", v)}
                />
              </div>
              <Text
                label="Email"
                value={f.email}
                onChange={(v) => set("email", v)}
                placeholder="you@example.com"
              />
              <Text
                label="Phone (optional)"
                value={f.phone}
                onChange={(v) => set("phone", v)}
                placeholder="(505) 555-0142"
              />
              <Text
                label="Mailing address (if different)"
                value={f.mailingAddress}
                onChange={(v) => set("mailingAddress", v)}
              />
            </Section>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button
                className="btn-ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
              >
                Back
              </button>
            ) : (
              <Link href="/" className="btn-ghost">
                Cancel
              </Link>
            )}
            {step < STEPS.length - 1 ? (
              <button
                className="btn-primary"
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </button>
            ) : (
              <button
                className="btn-primary"
                disabled={!canNext || submitting}
                onClick={submit}
              >
                {submitting ? "Checking…" : "See my result"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  eligibility,
  onProceed,
  submitting,
  error,
}: {
  eligibility: EligibilityResult;
  onProceed: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const isRefund = eligibility.track === "refund_claim";
  const refundActionable =
    isRefund &&
    !!eligibility.refundClaimDeadline &&
    new Date(eligibility.refundClaimDeadline) >= new Date();
  const canProceed =
    eligibility.recommendation !== "deadline_passed" || refundActionable;
  return (
    <div className="card p-8">
      <span
        className={`pill ${
          eligibility.recommendation === "worth_pursuing"
            ? "bg-green-100 text-green-800"
            : eligibility.recommendation === "needs_review"
              ? "bg-sky/10 text-sky"
              : refundActionable
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-700"
        }`}
      >
        {eligibility.recommendation === "worth_pursuing"
          ? "Looks worth pursuing"
          : eligibility.recommendation === "needs_review"
            ? "We'll review it closely"
            : refundActionable
              ? "Missed the protest window — refund claim possible"
              : "Deadline may have passed"}
      </span>
      <h1 className="mt-4 font-display text-2xl text-ink">
        Here&apos;s our first read
      </h1>
      <p className="mt-2 text-ink-soft">{eligibility.summary}</p>

      {eligibility.deadlineDays >= 0 && (
        <p className="mt-3 text-sm text-ink-faint">
          {eligibility.deadlineDays} day
          {eligibility.deadlineDays === 1 ? "" : "s"} until your protest
          deadline.
        </p>
      )}

      {eligibility.flags.length > 0 && (
        <div className="mt-6">
          <p className="label">What we noticed</p>
          <ul className="space-y-2">
            {eligibility.flags.map((flag, i) => (
              <li key={i} className="rounded-xl bg-sand-100/70 p-3 text-sm">
                <span className="font-medium text-ink">
                  {GROUND_LABELS[flag.ground as Ground]}
                </span>
                <span className="block text-ink-soft">{flag.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isRefund && refundActionable && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-ink-soft">
          <p className="font-medium text-ink">Claim for refund (District Court)</p>
          <p className="mt-1">
            The 30-day protest window has closed, but you can still challenge the
            value with a claim for refund — filed until{" "}
            <strong className="text-ink">January 10</strong>. Your first-half tax
            payment must be current. If we take it on, we handle the court
            filing.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink-soft">
        This is an automated first read, not a valuation or a promise. A person
        reviews every case before we file anything.
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {canProceed && (
        <button
          className="btn-primary mt-6 w-full py-3 text-base"
          onClick={onProceed}
          disabled={submitting}
        >
          {submitting
            ? "Preparing your agreement…"
            : isRefund
              ? "Review & sign to start my refund claim"
              : "Review & sign the agreement"}
        </button>
      )}
      <p className="mt-3 text-center text-xs text-ink-faint">
        30% of your tax savings · no savings, no fee
      </p>
    </div>
  );
}

/* --- small field primitives --- */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Money({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
          $
        </span>
        <input
          className="field pl-7"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-ink-soft">{label}</span>
    </label>
  );
}
