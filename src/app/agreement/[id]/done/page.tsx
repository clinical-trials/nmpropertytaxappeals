import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";

export default async function DonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agreement = await db.engagementAgreement.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!agreement) notFound();

  const signed = agreement.status === "completed";

  return (
    <div>
      <SiteHeader cta={false} />
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            signed ? "bg-green-100 text-green-700" : "bg-sand-200 text-ink-soft"
          }`}
        >
          <span className="text-2xl">{signed ? "✓" : "…"}</span>
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink">
          {signed ? "You're all set" : "Almost there"}
        </h1>
        <p className="mt-3 text-ink-soft">
          {signed
            ? `Thanks, ${agreement.client.firstName}. Your agreement is signed and we're now your authorized representative. We'll review your case and file the protest before your deadline — you'll hear from us by email.`
            : "Your signing isn't complete yet. If you closed the window early, you can reopen the agreement link from your email."}
        </p>
        <div className="mt-8">
          <Link href="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
