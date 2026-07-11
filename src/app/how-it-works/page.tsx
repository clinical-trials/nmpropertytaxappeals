import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "How it works — NM Tax Appeals",
};

const STEPS = [
  {
    t: "The county sets a value",
    d: "Each January 1 the assessor sets your property's value; a Notice of Value is mailed to you in the spring. Mass appraisal is broad-brush, so individual homes are often valued too high.",
  },
  {
    t: "You have 30 days to protest",
    d: "New Mexico law gives you 30 days from the mailing date to file a protest. Miss it and you generally wait a year. We watch that deadline for you.",
  },
  {
    t: "We build the case",
    d: "We pull comparable sales, weigh condition and the 3% residential cap, and check for exemptions you may have missed — then file the petition as your authorized representative.",
  },
  {
    t: "We negotiate and, if needed, go to hearing",
    d: "Most protests settle in informal review with the assessor. If yours doesn't, we present it to the county valuation protests board.",
  },
  {
    t: "You pay only from the savings",
    d: "Our fee is 30% of the tax you save. If we don't lower your bill, you owe nothing.",
  },
];

export default function HowItWorks() {
  return (
    <div>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-3xl text-ink">How an appeal works</h1>
        <p className="mt-2 text-ink-soft">
          Plain and unhurried. Here&apos;s the whole path, start to finish.
        </p>
        <ol className="mt-8 space-y-6">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-clay/10 font-display text-sm text-clay">
                {i + 1}
              </span>
              <div>
                <h2 className="font-display text-lg text-ink">{s.t}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/intake" className="btn-primary px-7 py-3 text-base">
            Start my appeal
          </Link>
        </div>
      </div>
    </div>
  );
}
