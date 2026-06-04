import { ProgressBar } from "@/components/ui/ProgressBar";
import { TierBadge } from "@/components/ui/TierBadge";
import type { DashboardTier } from "@/lib/ambassador";
import { tierLabel } from "@/lib/ambassador";
import type { Tier } from "@/lib/design/tokens";

type LevelCardProps = {
  tier: DashboardTier;
};

export function LevelCard({ tier }: LevelCardProps) {
  const current = tier.current_tier as Tier;
  const next = tier.next_tier as Tier | null;
  const target = tier.progress_target ?? tier.progress_current;

  return (
    <section className="rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig">
      <h3 className="text-base font-bold text-eig-blue">Mon Niveau</h3>

      <div className="mt-4">
        <TierBadge tier={current} size="lg" />
      </div>

      {next ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-slate-600">
            Prochain niveau : <span className="font-semibold text-eig-blue">Ambassadeur {tierLabel(next)}</span>
          </p>
          <ProgressBar
            value={tier.progress_current}
            max={target}
            label="Progression"
          />
          <p className="text-xs text-eig-muted">
            {tier.progress_current} / {target} inscriptions validées
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-tier-platinum">
          Vous avez atteint le niveau le plus élevé du programme.
        </p>
      )}
    </section>
  );
}
