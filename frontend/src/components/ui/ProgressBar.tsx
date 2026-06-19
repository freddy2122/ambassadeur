import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  showFraction?: boolean;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({
  value,
  max,
  label,
  showFraction = true,
  className,
  barClassName,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label || showFraction ? (
        <div className="flex items-center justify-between text-sm">
          {label ? <span className="font-medium text-slate-700">{label}</span> : <span />}
          {showFraction ? (
            <span className="font-semibold text-eig-blue">
              {value} / {max}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-eig-yellow to-eig-blue transition-all duration-500", barClassName)}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
