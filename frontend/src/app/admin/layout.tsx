"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, FileCog, Home, LogOut, Settings2, TimerReset } from "lucide-react";
import { clearToken } from "@/lib/api";
import { useClientTokenSnapshot } from "@/lib/useClientTokenSnapshot";

const navItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: Home },
  { href: "/admin/commissions", label: "Commissions", icon: BarChart3 },
  { href: "/admin/payouts", label: "Paiements", icon: CreditCard },
  { href: "/admin/payouts-auto", label: "Payouts auto", icon: TimerReset },
  { href: "/admin/rules", label: "Règles commissions", icon: FileCog },
  { href: "/admin/formations-pricing", label: "Tarifs formations", icon: Settings2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, hasToken } = useClientTokenSnapshot();

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasToken) router.replace("/connexion");
  }, [isHydrated, hasToken, router]);

  if (!isHydrated || !hasToken) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <p className="text-sm font-medium text-slate-600">Vérification de session admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-4 p-4 md:p-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          <p className="mb-4 px-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Administration</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-[#0b2e7a] text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => {
              clearToken();
              router.push("/connexion");
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
