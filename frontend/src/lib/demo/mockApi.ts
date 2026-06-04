import type { ApiResult } from "@/lib/api";
import { getAuthRole } from "@/lib/auth/session";
import { DEMO_TOKEN } from "@/lib/demo/config";
import {
  demoDashboard,
  demoEarnings,
  demoLeaderboard,
  demoLeads,
  demoNotifications,
  demoPayoutEligibility,
  demoProfile,
} from "@/lib/demo/data";

function ok<T>(data: T): ApiResult<T> {
  return { data };
}

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockApiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  await delay();

  const method = (options.method ?? "GET").toUpperCase();
  const [cleanPath] = path.split("?");

  if (cleanPath === "/auth/login" && method === "POST") {
    let role = "ambassador";
    try {
      const body = JSON.parse(String(options.body ?? "{}")) as { login?: string; email?: string };
      const id = (body.login ?? body.email ?? "").toLowerCase();
      if (id.includes("admin")) role = "admin";
    } catch {
      role = "ambassador";
    }
    return ok({ token: DEMO_TOKEN, user: { role } } as T);
  }

  if (cleanPath === "/auth/register" && method === "POST") {
    return ok({ message: "Compte créé (mode démo).", token: DEMO_TOKEN, user: { role: "ambassador" } } as T);
  }

  if (cleanPath === "/auth/verify-code" && method === "POST") {
    return ok({ token: DEMO_TOKEN, message: "Email vérifié (mode démo).", user: { role: "ambassador" } } as T);
  }

  if (cleanPath === "/auth/resend-code" && method === "POST") {
    return ok({ message: "Code renvoyé (mode démo)." } as T);
  }

  if (cleanPath === "/auth/forgot-password" && method === "POST") {
    return ok({ message: "Lien envoyé (mode démo)." } as T);
  }

  if (cleanPath === "/auth/reset-password" && method === "POST") {
    return ok({ message: "Mot de passe réinitialisé (mode démo)." } as T);
  }

  if (cleanPath === "/auth/logout" && method === "POST") {
    return ok({ message: "Déconnecté." } as T);
  }

  if (cleanPath === "/me/dashboard") return ok(demoDashboard as T);
  if (cleanPath === "/me/leaderboard") return ok(demoLeaderboard as T);
  if (cleanPath === "/me/earnings") return ok(demoEarnings as T);
  if (cleanPath === "/me/payout-eligibility") return ok(demoPayoutEligibility as T);
  if (cleanPath === "/me/profile" && method === "GET") {
    const role = getAuthRole() === "admin" ? "admin" : "ambassador";
    return ok({
      profile: { ...demoProfile.profile, role },
    } as T);
  }
  if (cleanPath === "/me/profile" && method === "PUT") {
    return ok({ message: "Profil mis à jour (mode démo).", requires_verification: false } as T);
  }
  if (cleanPath === "/me/referrals") return ok(demoLeads as T);
  if (cleanPath === "/me/notifications") return ok(demoNotifications as T);
  if (cleanPath.startsWith("/me/notifications/") && method === "POST") {
    return ok({ message: "Notification lue (mode démo)." } as T);
  }
  if (cleanPath === "/me/notifications/read-all" && method === "POST") {
    return ok({ message: "Toutes les notifications lues (mode démo)." } as T);
  }

  if (cleanPath === "/me/payout-requests" && method === "POST") {
    return ok({
      message: "Demande de retrait enregistrée (mode démo). Le paiement sera traité après validation.",
      count: 1,
      amount: 75_000,
    } as T);
  }

  if (cleanPath === "/me/commissions") {
    return ok({
      commissions: [
        { period_month: "2026-06", gross_amount: 25_000, validated_enrollments: 3, status: "approved", created_at: "2026-06-01" },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    } as T);
  }

  if (cleanPath === "/me/payouts") {
    return ok({
      payouts: [
        { amount: 25_000, status: "paid", method: "mtn", created_at: "2026-06-12" },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    } as T);
  }

  return { error: `Endpoint démo non mocké : ${method} ${cleanPath}` };
}
