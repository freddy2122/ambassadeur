import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  icon: LucideIcon;
  value: string | number;
  label: string;
  className?: string;
  iconClassName?: string;
};

export function StatCard({ icon: Icon, value, label, className, iconClassName }: StatCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col items-center rounded-eig-lg border border-slate-200 bg-white p-5 text-center shadow-eig",
        className,
      )}
    >
      <div className={cn("mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-eig-blue/10 text-eig-blue", iconClassName)}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <p className="text-2xl font-extrabold text-eig-blue md:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-eig-muted">{label}</p>
    </article>
  );
}
