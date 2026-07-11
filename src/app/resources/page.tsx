import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCounty } from "@/lib/nm/counties";

export const metadata = {
  title: "Bernalillo County protest resources — NM Tax Appeals",
};

export default function Resources() {
  const county = getCounty("bernalillo");
  const forms = county?.forms;

  return (
    <div>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-3xl text-ink">
          Bernalillo County property tax protests
        </h1>
        <p className="mt-2 text-ink-soft">
          The essentials, drawn from New Mexico statute. This is general
          information, not legal advice.
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
              assessor sets a hearing before the Bernalillo County Valuation
              Protests Board and notifies you by certified mail at least 15 days
              beforehand.
            </li>
            <li>
              <strong className="text-ink">An informal conference</strong> with
              the assessor may happen first — most protests resolve there.
            </li>
          </ul>
        </section>

        {/* What can lower a value */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">
            What can bring a value down
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">Comparable sales.</strong> Recent
              sales of similar nearby homes — especially your own recent purchase
              — are strong evidence of market value.
            </li>
            <li>
              <strong className="text-ink">The 3% residential cap.</strong> For
              most owner-occupied homes, the taxable value can&apos;t rise more
              than 3% year over year (NMSA § 7-36-21.2). Exceptions include new
              construction and a change of ownership.
            </li>
            <li>
              <strong className="text-ink">Condition.</strong> A mass appraisal
              rarely accounts for a bad roof, foundation issues, or deferred
              maintenance.
            </li>
            <li>
              <strong className="text-ink">Missing exemptions.</strong> The
              head-of-family and veteran / disabled-veteran exemptions reduce
              taxable value and are often left unclaimed. (Confirm current
              amounts with the assessor.)
            </li>
          </ul>
        </section>

        {/* UPC */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">
            Finding your UPC (Uniform Parcel Code)
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            The UPC is the number the assessor uses to identify your parcel. You
            can find it on your Notice of Value or by searching your address on
            the county assessor&apos;s property record search.
            {county?.assessor?.propertySearchUrl && (
              <>
                {" "}
                <a
                  href={county.assessor.propertySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-clay hover:text-clay-dark"
                >
                  Search the property record ↗
                </a>
              </>
            )}
          </p>
        </section>

        {/* Official forms */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">Official county forms</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {forms?.protestFormUrl && (
              <li>
                <a
                  href={forms.protestFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-clay hover:text-clay-dark"
                >
                  2026 Protest Form ↗
                </a>
              </li>
            )}
            {forms?.agentAuthorizationUrl && (
              <li>
                <a
                  href={forms.agentAuthorizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-clay hover:text-clay-dark"
                >
                  Agent Authorization ↗
                </a>
              </li>
            )}
            {forms?.residentialInfoUrl && (
              <li>
                <a
                  href={forms.residentialInfoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-clay hover:text-clay-dark"
                >
                  Residential Property Owner information sheet ↗
                </a>
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs text-ink-faint">
            When you engage us, you&apos;ll e-sign the services agreement and the
            county Agent Authorization together — that lets us file and argue the
            protest as your representative.
          </p>
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
