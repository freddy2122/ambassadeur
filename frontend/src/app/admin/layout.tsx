"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, FileCog, Home, LogOut, Settings2, TimerReset } from "lucide-react";
import { apiRequest } from "@/lib/api";
import {
  clearAuthSession,
  consumeAuthFlash,
  getAuthRole,
  isAdminRole,
  saveAuthSession,
  setAuthFlash,
} from "@/lib/auth/session";
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
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasToken) {
      router.replace("/connexion");
      return;
    }

    const flash = consumeAuthFlash();
    if (flash) setAccessNotice(flash);

    const storedRole = getAuthRole();
    if (storedRole && !isAdminRole(storedRole)) {
      setAuthFlash("L'administration est réservée aux comptes EIG. Vous avez été redirigé vers l'espace ambassadeur.");
      router.replace("/dashboard?notice=admin_only");
      return;
    }

    apiRequest<{ profile?: { role?: string } }>("/me/profile", {}, true).then((res) => {
      const role = res.data?.profile?.role;
      const token = window.localStorage.getItem("auth_token") ?? "";

      if (res.error && (res.error.includes("administrateur") || res.error.includes("403"))) {
        setAuthFlash("Vous n'avez pas les droits d'administration.");
        router.replace("/dashboard?notice=admin_only");
        return;
      }

      if (!isAdminRole(role)) {
        setAuthFlash("L'administration est réservée aux comptes EIG.");
        router.replace("/dashboard?notice=admin_only");
        return;
      }

      if (token) saveAuthSession(token, "admin");
      setRoleChecked(true);
    });
  }, [isHydrated, hasToken, router]);

  if (!isHydrated || !hasToken || !roleChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <p className="text-sm font-medium text-slate-600">Vérification des droits administrateur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-4 p-4 md:p-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          <p className="mb-4 px-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Administration EIG</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-eig-blue text-white" : "text-slate-700 hover:bg-slate-100"
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
              clearAuthSession();
              router.push("/connexion");
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          {accessNotice ? (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {accessNotice}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
