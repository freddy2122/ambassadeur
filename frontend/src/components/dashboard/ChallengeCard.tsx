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
    <section className="rounded-eig-lg border border-eig-yellow/50 bg-eig-yellow-light/50 p-5 shadow-eig">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-eig-yellow-light text-eig-blue ring-1 ring-eig-yellow/50">
          <Flame size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-eig-blue">Challenge en cours</p>
          <h3 className="text-lg font-bold text-eig-blue">{challenge.title}</h3>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        Objectif : {challenge.target_enrollments} inscriptions validées avant la date limite.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm">
        <Gift size={16} className="text-eig-blue" />
        <span className="font-medium text-slate-800">Prime : {formatFcfa(challenge.reward_amount)}</span>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={challenge.current_enrollments}
          max={challenge.target_enrollments}
          label="Progression"
        />
      </div>

      <p className="mt-3 text-xs text-slate-600">Fin : {endsLabel}</p>
    </section>
  );
}
