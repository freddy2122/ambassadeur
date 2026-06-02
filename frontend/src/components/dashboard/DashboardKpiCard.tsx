import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type DashboardKpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
};

export function DashboardKpiCard({ icon: Icon, label, value, className }: DashboardKpiCardProps) {
  return (
    <article className={cn("rounded-eig-lg border border-slate-200 bg-white p-4 shadow-eig", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-eig-muted">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-eig-blue">{value}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-eig-blue/10 text-eig-blue">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}
