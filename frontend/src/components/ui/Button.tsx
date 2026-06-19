import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "./LoadingState";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-white text-eig-blue hover:bg-slate-50",
  secondary: "bg-eig-blue text-white hover:bg-eig-blue-light",
  outline: "border border-white/60 bg-transparent text-white hover:bg-white/10",
  ghost: "bg-transparent text-eig-blue hover:bg-slate-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  href,
  className,
  type = "button",
  onClick,
  disabled,
  loading = false,
  loadingLabel,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eig-cyan focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
      {loading ? <LoadingSpinner size={16} className="text-current" /> : null}
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
