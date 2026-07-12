import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCounty, supportedCounties } from "@/lib/nm/counties";

export const metadata = {
  title: "New Mexico property tax protest resources — NM Tax Appeals",
};

function FormLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-clay hover:text-clay-dark"
    >
      {label} ↗
    </a>
  );
}

export default function Resources() {
  const counties = supportedCounties();
  const bern = getCounty("bernalillo");
  const refund = bern?.refundClaim;

  return (
    <div>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-3xl text-ink">
          New Mexico property tax protests
        </h1>
        <p className="mt-2 text-ink-soft">
          The essentials, drawn from New Mexico statute. We currently serve{" "}
          {counties.map((c) => c.name).join(" and ")}. General information, not
          legal advice.
        </p>

        {/* Process */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">
            How a protest works (NMSA 1978 § 7-38-24)
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">You have 30 days.</strong> A petition
              must be filed with the county assessor no later than 30 days after
              the assessor mails your Notice of Value.
            </li>
            <li>
              <strong className="text-ink">Your petition must state</strong> your
              name and address and a description of the property; why you believe
              the value, classification, allocation, or exemption denial is
              incorrect and what you believe is correct; and the value or
              classification that is <em>not</em> in dispute.
            </li>
            <li>
              <strong className="text-ink">A hearing is scheduled.</strong> The
              assessor sets a hearing before the county valuation protests board
              and notifies you by certified mail at least 15 days beforehand.
            </li>
            <li>
              <strong className="text-ink">An informal conference</strong> with
              the assessor may happen first — most protests resolve there.
            </li>
          </ul>
        </section>

        {/* Tax-saving programs */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">
            Tax-saving programs (often unclaimed)
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Veteran&apos;s exemption</strong> and{" "}
              <strong className="text-ink">disabled veteran exemption</strong>{" "}
              (100% service-connected) reduce taxable value — the disabled-veteran
              exemption can remove it entirely on a primary residence.
            </li>
            <li>
              <strong className="text-ink">Valuation freeze.</strong> Owners 65+
              (or disabled) within the income limit can freeze their property&apos;s
              value so it stops climbing.
            </li>
            <li>
              <strong className="text-ink">Head-of-family exemption</strong> and
              the general <strong className="text-ink">3% residential cap</strong>{" "}
              (NMSA § 7-36-21.2) also hold values down.
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink-faint">
            You don&apos;t need to file a protest to apply for these programs, but
            the application deadline is also 30 days after the NOV mailing.
          </p>
        </section>

        {/* Claim for refund */}
        {refund && (
          <section className="mt-10">
            <h2 className="font-display text-xl text-ink">
              Missed the 30-day window? Claim for refund
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              If the protest deadline passed, you can still challenge the value
              through a claim for refund filed in District Court{" "}
              <strong className="text-ink">until January 10</strong> of the
              following year. Your first-half tax payment must be current first.
            </p>
            <div className="mt-4 rounded-xl bg-sand-100/70 p-4 text-sm text-ink-soft">
              <p>
                <strong className="text-ink">Bernalillo County:</strong>{" "}
                {refund.court}
                {refund.address ? `, ${refund.address}` : ""}
                {refund.room ? `, ${refund.room}` : ""}.
              </p>
              {refund.filingFee && (
                <p className="mt-1">Filing fee: {refund.filingFee}</p>
              )}
              {refund.forms && (
                <ul className="mt-2 space-y-1">
                  {refund.forms.map((fl) => (
                    <li key={fl.url}>
                      <FormLink url={fl.url} label={fl.label} />
                    </li>
                  ))}
                </ul>
              )}
              {refund.selfHelp && (
                <p className="mt-2 text-xs text-ink-faint">{refund.selfHelp}</p>
              )}
            </div>
          </section>
        )}

        {/* Counties we serve */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">Counties we serve</h2>
          <div className="mt-4 space-y-5">
            {counties.map((c) => (
              <div key={c.slug}>
                <h3 className="font-display text-lg text-ink">{c.name}</h3>
                <p className="text-sm text-ink-soft">
                  {c.assessor?.office}
                  {c.assessor?.phone ? ` · ${c.assessor.phone}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {c.assessor?.appealPortalUrl && (
                    <FormLink
                      url={c.assessor.appealPortalUrl}
                      label="Appeal portal"
                    />
                  )}
                  {c.assessor?.propertySearchUrl && (
                    <FormLink
                      url={c.assessor.propertySearchUrl}
                      label="UPC / property search"
                    />
                  )}
                  {c.forms?.protestFormUrl && (
                    <FormLink url={c.forms.protestFormUrl} label="Protest form" />
                  )}
                  {c.forms?.pamphletUrl && (
                    <FormLink url={c.forms.pamphletUrl} label="Pamphlet" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <Link href="/intake" className="btn-primary px-7 py-3 text-base">
            Start my appeal
          </Link>
        </div>
      </div>
    </div>
  );
}
