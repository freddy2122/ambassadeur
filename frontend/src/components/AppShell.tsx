"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DemoBanner } from "@/components/DemoBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";

type AppShellProps = {
  children: React.ReactNode;
};

const PLAIN_ROUTES = [
  "/connexion",
  "/inscription",
  "/partenaires/inscription",
  "/dashboard",
  "/admin",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isPlainLayout = useMemo(() => {
    return PLAIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  }, [pathname]);

  if (isPlainLayout) {
    return (
      <>
        <DemoBanner />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pt-20 pb-24 md:pt-24 md:pb-8">{children}</main>
      <footer id="contact" className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-slate-600">
          <p>© EIG Ambassadeur.</p>
          <p>contact@eiggroupe.com</p>
        </div>
      </footer>
      <MobileBottomNav />
    </>
  );
}
