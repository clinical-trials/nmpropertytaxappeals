import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <div>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-8 pt-8 sm:px-6 sm:pt-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-clay sm:text-sm">
          New Mexico · Bernalillo &amp; Santa Fe counties
        </p>
        <h1 className="max-w-3xl font-display text-[2.1rem] leading-[1.08] text-ink sm:text-6xl sm:leading-[1.05]">
          Your property may be
          <br />
          over-assessed. We appeal it
          <br />
          <span className="text-clay">for you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Every spring the county mails a Notice of Value. You have{" "}
          <strong className="text-ink">30 days</strong> to protest it. We handle
          the whole thing — the paperwork, the comps, the hearing. You pay only
          if we lower your bill.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/intake" className="btn-primary px-7 py-3 text-base">
            Start my appeal
          </Link>
          <span className="text-sm text-ink-faint">
            Takes about 3 minutes · no upfront cost
          </span>
        </div>
      </section>

      {/* Fee band */}
      <section className="mx-auto max-w-5xl px-6 py-6">
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl text-ink">
              30% of what we save you
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              A contingency fee on your tax savings. No savings, no fee.
            </p>
          </div>
          <Link href="/intake" className="btn-ghost">
            See if you qualify →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 font-display text-2xl text-ink">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Tell us about your home",
              d: "Enter your address and the numbers from your Notice of Value. We flag whether an appeal looks worthwhile.",
            },
            {
              n: "02",
              t: "Sign us on",
              d: "Review and e-sign the services agreement. We become your authorized representative with the assessor.",
            },
            {
              n: "03",
              t: "We do the rest",
              d: "We file the protest, argue the comps, negotiate, and go to the valuation protests board if needed.",
            },
          ].map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-display text-sm text-clay">{s.n}</div>
              <h3 className="mt-2 font-display text-lg text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honesty / disclaimer */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border border-ink/10 bg-sand-100/60 p-6 text-sm leading-relaxed text-ink-soft">
          <p className="font-medium text-ink">Straight talk</p>
          <p className="mt-2">
            We can&apos;t promise a reduction — no one honestly can, and we
            won&apos;t pretend otherwise. We only take a case forward when we
            think a reduction is reasonably achievable, and our fee is a share of
            the actual savings. New Mexico assesses residential property at
            one-third of market value, with a general 3% annual cap on increases;
            those rules are often where the savings hide.
          </p>
        </div>
      </section>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <span>NM Tax Appeals LLC · Bernalillo County, New Mexico</span>
          <span>support@newmexicoappeals.com</span>
        </div>
      </footer>
    </div>
  );
}
