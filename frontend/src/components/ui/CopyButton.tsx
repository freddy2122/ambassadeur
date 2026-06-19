"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function CopyButton({ value, label = "Copier", className, disabled = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !value}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-eig-blue transition-colors hover:bg-slate-50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
      {copied ? "Copié" : label}
    </button>
  );
}
