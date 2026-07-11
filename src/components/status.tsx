import { CASE_STATUS_LABELS, CaseStatus } from "@/lib/enums";
import { daysUntil, deadlineUrgency } from "@/lib/nm/law";

const STATUS_CLASSES: Record<CaseStatus, string> = {
  intake: "bg-sky/10 text-sky",
  qualified: "bg-amber-100 text-amber-800",
  engaged: "bg-green-100 text-green-800",
  filed: "bg-indigo-100 text-indigo-800",
  informal: "bg-purple-100 text-purple-800",
  hearing_scheduled: "bg-orange-100 text-orange-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-sand-200 text-ink-soft",
  declined: "bg-red-100 text-red-700",
};

export function StatusPill({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status as CaseStatus] ?? "bg-sand-200 text-ink-soft";
  const label = CASE_STATUS_LABELS[status as CaseStatus] ?? status;
  return <span className={`pill ${cls}`}>{label}</span>;
}

export function DeadlineBadge({ deadline }: { deadline: Date }) {
  const days = daysUntil(deadline);
  const urgency = deadlineUrgency(deadline);
  const cls =
    urgency === "past"
      ? "bg-red-100 text-red-700"
      : urgency === "urgent"
        ? "bg-orange-100 text-orange-800"
        : urgency === "soon"
          ? "bg-amber-100 text-amber-800"
          : "bg-sand-200 text-ink-soft";
  const text =
    days < 0
      ? `${Math.abs(days)}d past`
      : days === 0
        ? "due today"
        : `${days}d left`;
  return <span className={`pill ${cls}`}>{text}</span>;
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
