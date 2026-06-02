import { cn } from "@/lib/cn";
import type { Tier } from "@/lib/design/tokens";
import { tierDescriptions, tierLabels } from "@/lib/design/tokens";
import { TierIcon, tierConfig } from "@/components/ui/TierBadge";

const tierBg: Record<Tier, string> = {
  bronze: "bg-tier-bronze-bg border-tier-bronze/20",
  argent: "bg-tier-silver-bg border-tier-silver/20",
  or: "bg-tier-gold-bg border-tier-gold/20",
  platine: "bg-tier-platinum-bg border-tier-platinum/20",
};

type TierCardProps = {
  tier: Tier;
  className?: string;
};

export function TierCard({ tier, className }: TierCardProps) {
  const config = tierConfig[tier];

  return (
    <article
      className={cn(
        "flex flex-col items-center rounded-eig-lg border p-6 text-center transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-eig-lg",
        tierBg[tier],
        className,
      )}
    >
      <div className={cn("mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm", config.text)}>
        <TierIcon tier={tier} className="h-7 w-7" />
      </div>
      <h3 className={cn("text-xl font-extrabold", config.text)}>{tierLabels[tier]}</h3>
      <p className="mt-2 text-sm text-slate-600">{tierDescriptions[tier]}</p>
    </article>
  );
}
