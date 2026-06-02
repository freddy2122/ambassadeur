import { demoPlatformStats } from "@/lib/demo/data";
import { isDemoMode } from "@/lib/demo/config";
import type { PlatformStats } from "@/lib/design/tokens";
import { defaultPlatformStats } from "@/lib/design/tokens";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.partnext.org/api/v1";

type PublicStatsResponse = {
  ambassadors?: number;
  validated_enrollments?: number;
  total_distributed?: number;
};

export async function fetchPlatformStats(): Promise<PlatformStats> {
  if (isDemoMode) {
    return demoPlatformStats;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/platform-stats`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return defaultPlatformStats;
    const json = (await res.json()) as { data?: PublicStatsResponse };
    const data = json.data;
    if (!data) return defaultPlatformStats;
    return {
      ambassadors: data.ambassadors ?? defaultPlatformStats.ambassadors,
      validatedEnrollments: data.validated_enrollments ?? defaultPlatformStats.validatedEnrollments,
      totalDistributed: data.total_distributed ?? defaultPlatformStats.totalDistributed,
    };
  } catch {
    return defaultPlatformStats;
  }
}

export function formatFcfa(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
