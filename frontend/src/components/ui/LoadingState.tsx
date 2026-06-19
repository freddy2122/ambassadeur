import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type LoadingSpinnerProps = {
  className?: string;
  size?: number;
};

export function LoadingSpinner({ className, size = 18 }: LoadingSpinnerProps) {
  return <Loader2 className={cn("animate-spin shrink-0", className)} size={size} aria-hidden="true" />;
}

type LoadingBlockProps = {
  label?: string;
  className?: string;
};

export function LoadingBlock({ label = "Chargement…", className }: LoadingBlockProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm text-slate-600", className)}>
      <LoadingSpinner />
      <span>{label}</span>
    </div>
  );
}

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function SubmitButton({
  loading = false,
  loadingLabel,
  children,
  className,
  disabled,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <LoadingSpinner size={16} className="text-current" /> : null}
      {loading ? (loadingLabel ?? "Chargement…") : children}
    </button>
  );
}

type LoadingButtonProps = Omit<SubmitButtonProps, "type"> & {
  type?: "button" | "submit" | "reset";
};

/** Bouton d’action (hors formulaire) avec spinner intégré. */
export function LoadingButton({ type = "button", ...props }: LoadingButtonProps) {
  return <SubmitButton type={type} {...props} />;
}
