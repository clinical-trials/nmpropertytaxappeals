import Link from "next/link";
import { db } from "@/lib/db";
import { requireOperator } from "@/lib/admin-auth";
import { AdminBar } from "@/components/AdminBar";
import { StatusPill, DeadlineBadge } from "@/components/status";
import { formatUsd } from "@/lib/savings";
import { getCounty } from "@/lib/nm/counties";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireOperator();

  const cases = await db.case.findMany({
    include: { client: true, property: true },
    orderBy: [{ status: "asc" }, { protestDeadline: "asc" }],
  });

  const open = cases.filter(
    (c) => !["closed", "declined"].includes(c.status)
  );

  return (
    <div>
      <AdminBar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink">Cases</h1>
            <p className="text-sm text-ink-faint">
              {open.length} open · {cases.length} total
            </p>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="card p-10 text-center text-ink-soft">
            No cases yet. They&apos;ll appear here as homeowners complete intake.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-sand-100/70 text-left text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Owner / property</th>
                  <th className="px-4 py-3 font-medium">County</th>
                  <th className="px-4 py-3 font-medium">Assessed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-ink/5 hover:bg-sand-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="font-medium text-ink hover:text-clay"
                      >
                        {c.client.firstName} {c.client.lastName}
                      </Link>
                      <div className="text-xs text-ink-faint">
                        {c.property.situsAddress}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {getCounty(c.countyId)?.name ?? c.countyId}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatUsd(c.initialAssessedValue)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <DeadlineBadge deadline={c.protestDeadline} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
