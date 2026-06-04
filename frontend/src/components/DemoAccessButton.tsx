"use client";

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { saveAuthSession } from "@/lib/auth/session";
import { DEMO_TOKEN, isDemoMode } from "@/lib/demo/config";
import { cn } from "@/lib/cn";

type DemoAccessButtonProps = {
  className?: string;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export function DemoAccessButton({ className, size = "lg" }: DemoAccessButtonProps) {
  const router = useRouter();

  if (!isDemoMode) return null;

  function openDemo() {
    saveAuthSession(DEMO_TOKEN, "ambassador");
    router.push("/dashboard");
  }

  return (
    <button
      type="button"
      onClick={openDemo}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-eig-cyan/60 bg-eig-cyan/15 font-semibold text-white transition-colors",
        "hover:bg-eig-cyan/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eig-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-eig-blue",
        sizeClasses[size],
        className,
      )}
    >
      <Play size={size === "lg" ? 18 : 16} fill="currentColor" />
      Voir la démo
    </button>
  );
}
