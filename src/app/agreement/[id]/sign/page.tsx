import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { SignButton } from "./SignButton";

export const dynamic = "force-dynamic";

export default async function SignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agreement = await db.engagementAgreement.findUnique({
    where: { id },
    include: { documents: { orderBy: { order: "asc" } } },
  });
  if (!agreement) notFound();
  if (agreement.status === "completed") {
    redirect(`/agreement/${id}/done`);
  }

  const docs = agreement.documents.length
    ? agreement.documents
    : [
        {
          id: "none",
          name: "Agreement",
          html: "<p>Agreement unavailable.</p>",
          sourceUrl: null,
        },
      ];

  return (
    <div>
      <SiteHeader cta={false} />
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="font-display text-2xl text-ink">
          Review &amp; sign — {docs.length} document{docs.length === 1 ? "" : "s"}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Please read each document. One signature covers the whole packet.
        </p>

        <div className="mt-5 space-y-6">
          {docs.map((doc, i) => (
            <div key={doc.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">
                  {i + 1}. {doc.name}
                </h2>
                {doc.sourceUrl && (
                  <a
                    href={doc.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-clay hover:text-clay-dark"
                  >
                    Official county form ↗
                  </a>
                )}
              </div>
              <div className="card overflow-hidden">
                <iframe
                  title={doc.name}
                  srcDoc={doc.html}
                  className="h-[480px] w-full bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <SignButton agreementId={agreement.id} documentCount={docs.length} />
        </div>
      </div>
    </div>
  );
}
