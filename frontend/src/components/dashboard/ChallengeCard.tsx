import { ProgressBar } from "@/components/ui/ProgressBar";
import { Flame, Gift } from "lucide-react";
import { formatFcfa } from "@/lib/platformStats";
import type { DashboardChallenge } from "@/lib/ambassador";

type ChallengeCardProps = {
  challenge: DashboardChallenge;
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const endsAt = challenge.ends_at ? new Date(challenge.ends_at) : null;
  const endsLabel = endsAt
    ? endsAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : "Bientôt";

  return (
    <section className="rounded-eig-lg border border-eig-gold/25 bg-gradient-to-br from-eig-gold-light/80 to-white p-5 shadow-eig">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-eig-gold text-eig-blue">
          <Flame size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-eig-gold-dark">Challenge en cours</p>
          <h3 className="text-lg font-bold text-eig-blue">{challenge.title}</h3>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        Objectif : {challenge.target_enrollments} inscriptions validées avant la date limite.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm">
        <Gift size={16} className="text-eig-gold-dark" />
        <span className="font-medium text-slate-800">Prime : {formatFcfa(challenge.reward_amount)}</span>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={challenge.current_enrollments}
          max={challenge.target_enrollments}
          label="Progression"
        />
      </div>

      <p className="mt-3 text-xs text-eig-gold-dark">Fin : {endsLabel}</p>
    </section>
  );
}
