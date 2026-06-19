import { API_BASE_URL } from "@/lib/api";

type FormationPricingItem = {
  slug: string;
  title: string;
  base_price?: number | null;
  discount_price?: number | null;
  registration_fee?: number | null;
  is_active?: boolean;
};

type CommissionRuleItem = {
  program_type: string;
  tier: "bronze" | "argent" | "or";
  min_enrollments?: number | null;
  max_enrollments?: number | null;
  amount_per_enrollment?: number | null;
};

export async function fetchFormationPricingCatalog(): Promise<FormationPricingItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/formations/pricing`, {
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: FormationPricingItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCommissionRulesCatalog(): Promise<CommissionRuleItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/commission-rules`, {
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: CommissionRuleItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}
