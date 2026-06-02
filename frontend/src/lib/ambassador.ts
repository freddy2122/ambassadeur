import type { Tier } from "@/lib/design/tokens";
import { tierLabels } from "@/lib/design/tokens";

export type EarningsHistoryItem = {
  id: number;
  date?: string | null;
  label: string;
  amount: number;
  status: "validated" | "pending" | "paid" | string;
  status_label: string;
};

export type EarningsResponse = {
  earnings?: {
    available?: number;
    pending?: number;
    paid?: number;
  };
  history?: EarningsHistoryItem[];
};

export type PayoutEligibilityResponse = {
  earnings?: {
    available?: number;
    pending?: number;
    paid?: number;
  };
  eligible_count?: number;
  eligible_total_xof?: number;
  payment_profile?: {
    payment_method?: string | null;
    payment_account?: string | null;
    payment_account_holder?: string | null;
    phone?: string | null;
  };
  blockers?: {
    email_verification_required?: boolean;
    payment_profile_incomplete?: boolean;
  };
};

export type DashboardTier = {
  current_tier: Tier;
  next_tier: Tier | null;
  progress_current: number;
  progress_target: number | null;
};

export type DashboardChallenge = {
  id: number;
  title: string;
  description?: string | null;
  target_enrollments: number;
  reward_amount: number;
  current_enrollments: number;
  ends_at?: string;
  status?: string;
};

export type DashboardResponse = {
  profile?: {
    name?: string;
    first_name?: string;
  };
  kpis?: {
    prospects?: number;
    leads?: number;
    validated_enrollments?: number;
    available_earnings?: number;
    rank?: number;
    clicks?: number;
    total_commission?: number;
  };
  referral?: {
    code?: string | null;
    personal_url?: string | null;
    display_url?: string | null;
  };
  tier?: DashboardTier;
  earnings?: {
    available?: number;
    pending?: number;
    paid?: number;
  };
  challenge?: DashboardChallenge | null;
};

export type LeaderboardEntry = {
  id: number;
  name: string;
  validated_enrollments: number;
  rank: number;
};

export type LeaderboardResponse = {
  leaderboard?: LeaderboardEntry[];
  me?: {
    id?: number;
    name?: string;
    first_name?: string;
    rank?: number;
    validated_enrollments?: number;
  };
};

export function formatRank(rank: number): string {
  if (rank <= 0) return "—";
  return `${rank}e`;
}

export function ambassadorDisplayName(profile?: { first_name?: string; name?: string }): string {
  return profile?.first_name?.trim() || profile?.name?.trim() || "Ambassadeur";
}

export function tierLabel(tier?: string | null): string {
  if (!tier || !(tier in tierLabels)) return "Bronze";
  return tierLabels[tier as Tier];
}
