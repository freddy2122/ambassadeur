import { isDemoMode } from "@/lib/demo/config";

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 md:text-sm">
      Mode démonstration — les données affichées sont fictives. L&apos;API sera branchée après validation.
    </div>
  );
}
