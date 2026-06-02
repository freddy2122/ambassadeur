import { cn } from "@/lib/cn";
import type { Tier } from "@/lib/design/tokens";
import { tierLabels } from "@/lib/design/tokens";
import { Award, Crown, Gem, Medal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tierConfig: Record<Tier, { icon: LucideIcon; badge: string; text: string }> = {
  bronze: {
    icon: Medal,
    badge: "bg-tier-bronze/15 text-tier-bronze border-tier-bronze/30",
    text: "text-tier-bronze",
  },
  argent: {
    icon: Award,
    badge: "bg-tier-silver-bg text-tier-silver border-tier-silver/30",
    text: "text-tier-silver",
  },
  or: {
    icon: Crown,
    badge: "bg-tier-gold-bg text-tier-gold border-tier-gold/30",
    text: "text-tier-gold",
  },
  platine: {
    icon: Gem,
    badge: "bg-tier-platinum-bg text-tier-platinum border-tier-platinum/30",
    text: "text-tier-platinum",
  },
};

type TierBadgeProps = {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1 text-sm gap-1.5",
  lg: "px-4 py-1.5 text-base gap-2",
};

const iconSizes = { sm: 12, md: 14, lg: 16 };

export function TierBadge({ tier, size = "md", showIcon = true, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        config.badge,
        sizeClasses[size],
        className,
      )}
    >
      {showIcon ? <Icon size={iconSizes[size]} strokeWidth={2.5} /> : null}
      Ambassadeur {tierLabels[tier]}
    </span>
  );
}

export function TierIcon({ tier, className }: { tier: Tier; className?: string }) {
  const config = tierConfig[tier];
  const Icon = config.icon;
  return <Icon className={cn(config.text, className)} strokeWidth={2} />;
}

export { tierConfig };
