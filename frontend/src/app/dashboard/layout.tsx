"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  clearAuthSession,
  consumeAuthFlash,
  getAuthRole,
  isAdminRole,
  resolveProfileRole,
  saveAuthSession,
  setAuthFlash,
} from "@/lib/auth/session";
import { useClientTokenSnapshot } from "@/lib/useClientTokenSnapshot";
import { useClientSearchParamsSnapshot } from "@/lib/useClientSearchParamsSnapshot";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { Bell, LayoutDashboard, LogOut, Trophy, UserRound, Wallet } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/classement", label: "Classement", icon: Trophy },
  { href: "/dashboard/commissions", label: "Gains", icon: Wallet },
  { href: "/dashboard/profil", label: "Profil", icon: UserRound },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Accueil",
  "/dashboard/classement": "Classement",
  "/dashboard/commissions": "Mes gains",
  "/dashboard/paiements": "Demande de retrait",
  "/dashboard/profil": "Mon profil",
  "/dashboard/leads": "Mes prospects",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useClientSearchParamsSnapshot();
  const { isHydrated, hasToken } = useClientTokenSnapshot();
  const [partnerName, setPartnerName] = useState("Ambassadeur");
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
  }>>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasToken) {
      router.replace("/connexion");
    }
  }, [isHydrated, hasToken, router]);

  useEffect(() => {
    const flash = consumeAuthFlash();
    const paramNotice = searchParams.get("notice");
    if (flash) setAccessNotice(flash);
    else if (paramNotice === "admin_only") {
      setAccessNotice("Cet espace est réservé aux ambassadeurs. Utilisez /admin si vous êtes administrateur.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isHydrated || !hasToken) return;

    const storedRole = getAuthRole();
    if (isAdminRole(storedRole)) {
      setAuthFlash("Vous êtes connecté en tant qu'administrateur.");
      router.replace("/admin");
      return;
    }

    apiRequest<{ profile?: { name?: string; role?: string } }>("/me/profile", {}, true).then((res) => {
      if (res.error?.includes("administrateur") || res.error?.includes("403")) {
        setAuthFlash("Accès réservé à l'administration EIG.");
        router.replace("/admin");
        return;
      }

      const role = resolveProfileRole(res.data?.profile?.role, getAuthRole());
      if (isAdminRole(role)) {
        saveAuthSession(window.localStorage.getItem("auth_token") ?? "", role);
        setAuthFlash("Vous êtes connecté en tant qu'administrateur.");
        router.replace("/admin");
        return;
      }

      const token = window.localStorage.getItem("auth_token");
      if (token) saveAuthSession(token, role);

      const name = res.data?.profile?.name?.trim();
      if (name) setPartnerName(name);
    });
  }, [isHydrated, hasToken, router]);

  useEffect(() => {
    if (!isHydrated || !hasToken) return;
    apiRequest<{ unread_count?: number; notifications?: Array<{
      id: string;
      title: string;
      message: string;
      action_url?: string | null;
      read_at?: string | null;
      created_at?: string | null;
    }> }>("/me/notifications", {}, true).then((res) => {
      setUnreadCount(res.data?.unread_count ?? 0);
      setNotifications(res.data?.notifications ?? []);
    });
  }, [isHydrated, hasToken, pathname]);

  if (!isHydrated || !hasToken) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <p className="text-sm font-medium text-slate-600">Vérification de session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-4 p-4 md:p-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 rounded-eig-lg border border-slate-200 bg-white p-4 lg:block">
          <div className="mb-4 flex items-center gap-2 px-2">
            <Image src="/favicon-32.png" alt="EIG" width={18} height={18} />
            <p className="text-sm font-semibold uppercase tracking-wide text-eig-muted">EIG Ambassadors</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-eig-blue text-white shadow-sm ring-1 ring-eig-gold/50"
                      : "text-slate-700 hover:bg-eig-gold-light/50"
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
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </aside>

        <div className="relative min-w-0 flex-1">
          <header className="mb-3 rounded-eig-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/" className="inline-flex rounded-md p-1 hover:bg-slate-100" aria-label="Retour à l'accueil">
                    <Image src="/favicon-32.png" alt="EIG" width={20} height={20} />
                  </Link>
                  <p className="text-xs font-semibold uppercase tracking-wide text-eig-muted">Espace ambassadeur</p>
                </div>
                <h1 className="text-lg font-bold text-eig-blue">
                  {pageTitles[pathname] ?? "Espace ambassadeur"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-eig-gold px-1 text-[10px] font-bold text-eig-blue">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
                {isNotifOpen ? (
                  <div className="absolute right-4 top-20 z-20 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:right-6">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Notifications</p>
                      <button
                        type="button"
                        className="text-xs font-medium text-eig-blue hover:underline"
                        onClick={async () => {
                          await apiRequest("/me/notifications/read-all", { method: "POST" }, true);
                          setUnreadCount(0);
                          setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
                        }}
                      >
                        Tout marquer lu
                      </button>
                    </div>
                    <div className="max-h-72 space-y-2 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucune notification.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`rounded-lg border p-2 ${n.read_at ? "border-slate-200 bg-white" : "border-eig-cyan/20 bg-eig-cyan/5"}`}>
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-600">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:inline-flex">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-eig-gold text-xs font-bold text-eig-blue">
                    {getInitials(partnerName)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{partnerName}</span>
                </div>
              </div>
            </div>
          </header>

          {accessNotice ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {accessNotice}
            </div>
          ) : null}
          {children}
        </div>
      </div>
      <DashboardMobileNav />
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "AM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
