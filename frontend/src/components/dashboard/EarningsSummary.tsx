import { CheckCircle2, Clock3, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatFcfa } from "@/lib/platformStats";

type EarningsSummaryProps = {
  available: number;
  pending: number;
  paid: number;
  className?: string;
};

const cards = [
  {
    key: "available" as const,
    label: "Disponible",
    icon: Wallet,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    valueClass: "text-emerald-700",
  },
  {
    key: "pending" as const,
    label: "En attente",
    icon: Clock3,
    accent: "text-amber-600 bg-amber-50 border-amber-100",
    valueClass: "text-amber-700",
  },
  {
    key: "paid" as const,
    label: "Déjà payé",
    icon: CheckCircle2,
    accent: "text-eig-blue bg-eig-cyan/10 border-eig-cyan/20",
    valueClass: "text-eig-blue",
  },
];

export function EarningsSummary({ available, pending, paid, className }: EarningsSummaryProps) {
  const values = { available, pending, paid };

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {cards.map(({ key, label, icon: Icon, accent, valueClass }) => (
        <article key={key} className={cn("rounded-eig-lg border p-5 shadow-eig", accent)}>
          <div className="flex items-center gap-2">
            <Icon size={18} />
            <p className="text-sm font-semibold">{label}</p>
          </div>
          <p className={cn("mt-3 text-2xl font-extrabold", valueClass)}>{formatFcfa(values[key])}</p>
        </article>
      ))}
    </div>
  );
}
