import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StepCardProps = {
  step: number;
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
};

export function StepCard({ step, title, description, icon: Icon, className }: StepCardProps) {
  return (
    <article className={cn("relative rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eig-blue text-sm font-bold text-white">
          {step}
        </span>
        {Icon ? (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-eig-cyan/10 text-eig-cyan">
            <Icon size={20} strokeWidth={2} />
          </div>
        ) : null}
      </div>
      <h3 className="text-lg font-bold text-eig-blue">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}
