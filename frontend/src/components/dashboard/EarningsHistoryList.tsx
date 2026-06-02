import { CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatFcfa } from "@/lib/platformStats";
import type { EarningsHistoryItem } from "@/lib/ambassador";

const statusStyles: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  validated: {
    icon: Sparkles,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  pending: {
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  paid: {
    icon: CheckCircle2,
    className: "bg-eig-cyan/10 text-eig-blue border-eig-cyan/20",
  },
};

type EarningsHistoryListProps = {
  items: EarningsHistoryItem[];
};

export function EarningsHistoryList({ items }: EarningsHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-eig-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Aucun gain enregistré pour le moment.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-eig-lg border border-slate-200 bg-white shadow-eig">
      {items.map((item) => {
        const style = statusStyles[item.status] ?? statusStyles.pending;
        const Icon = style.icon;

        return (
          <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-eig-muted">
                {item.date ? formatHistoryDate(item.date) : "—"}
              </p>
              <p className="mt-1 font-semibold text-eig-blue">{item.label}</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatFcfa(item.amount)}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                style.className,
              )}
            >
              <Icon size={14} />
              {item.status_label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function formatHistoryDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
  });
}
