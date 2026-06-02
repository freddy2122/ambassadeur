import Image from "next/image";
import {
  GraduationCap,
  Share2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Button, SectionHeading, StatCard, StepCard, TierCard } from "@/components/ui";
import { DemoAccessButton } from "@/components/DemoAccessButton";
import { howItWorksSteps, tiers } from "@/lib/design/tokens";
import { fetchPlatformStats, formatFcfa } from "@/lib/platformStats";

export default async function Home() {
  const stats = await fetchPlatformStats();

  return (
    <div className="space-y-10 md:space-y-14">
      <section id="hero" className="overflow-hidden rounded-eig-lg border border-eig-blue bg-eig-blue shadow-eig-lg">
        <div className="relative p-6 md:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-eig-cyan/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

          <div className="relative">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/eig-logo.svg" alt="EIG" width={120} height={40} priority className="brightness-0 invert" />
              <span className="hidden h-5 w-px bg-white/30 sm:block" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-eig-cyan-light sm:text-sm">
                EIG Ambassadors
              </p>
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
              Deviens Ambassadeur EIG
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 md:text-lg">
              Partage une opportunité. Transforme une vie. Gagne des récompenses.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/partenaires/inscription" variant="primary" size="lg">
                Devenir Ambassadeur
              </Button>
              <Button href="/connexion" variant="outline" size="lg">
                Se connecter
              </Button>
              <DemoAccessButton size="lg" />
            </div>
          </div>
        </div>
      </section>

      <section id="stats" aria-label="Statistiques du programme">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} value={stats.ambassadors.toLocaleString("fr-FR")} label="Ambassadeurs" />
          <StatCard
            icon={GraduationCap}
            value={stats.validatedEnrollments.toLocaleString("fr-FR")}
            label="Étudiants recommandés"
          />
          <StatCard
            icon={Wallet}
            value={formatFcfa(stats.totalDistributed)}
            label="Distribués"
            iconClassName="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      <section id="comment" className="rounded-eig-lg border border-slate-200 bg-white p-6 md:p-8">
        <SectionHeading title="Comment ça marche ?" subtitle="Quatre étapes simples pour commencer à gagner." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((item) => (
            <StepCard
              key={item.step}
              step={item.step}
              title={item.title}
              description={item.description}
              icon={
                item.step === 1
                  ? UserPlus
                  : item.step === 2
                    ? Share2
                    : item.step === 3
                      ? GraduationCap
                      : Wallet
              }
            />
          ))}
        </div>
      </section>

      <section id="recompenses" className="rounded-eig-lg border border-slate-200 bg-eig-surface p-6 md:p-8">
        <SectionHeading
          title="Récompenses"
          subtitle="Monte en niveau à mesure que tes inscriptions validées augmentent."
          align="center"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard key={tier} tier={tier} />
          ))}
        </div>
      </section>

      <section className="rounded-eig-lg bg-gradient-to-r from-eig-blue to-eig-blue-light p-6 text-center md:p-10">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">Prêt à commencer ?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 md:text-base">
          Rejoins des centaines d&apos;ambassadeurs qui transforment leur réseau en impact et en revenus.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/partenaires/inscription" variant="primary" size="lg">
            Créer mon compte
          </Button>
          <Button href="/connexion" variant="outline" size="lg">
            J&apos;ai déjà un compte
          </Button>
          <DemoAccessButton size="lg" />
        </div>
      </section>
    </div>
  );
}
