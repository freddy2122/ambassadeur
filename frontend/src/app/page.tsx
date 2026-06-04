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
  const hasStats =
    stats.ambassadors > 0 || stats.validatedEnrollments > 0 || stats.totalDistributed > 0;

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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-eig-cyan-light sm:text-sm">
                Programme Ambassadeur
              </p>
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl">
              Devenez ambassadeur EIG
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200 md:text-lg">
              Recommandez nos formations et percevez une commission pour chaque inscription validée
              via votre code de parrainage.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/partenaires/inscription" variant="primary" size="lg">
                S&apos;inscrire
              </Button>
              <Button href="/connexion" variant="outline" size="lg">
                Se connecter
              </Button>
              <DemoAccessButton size="lg" />
            </div>
          </div>
        </div>
      </section>

      {hasStats ? (
        <section id="stats" aria-label="Statistiques du programme">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Users} value={stats.ambassadors.toLocaleString("fr-FR")} label="Ambassadeurs" />
            <StatCard
              icon={GraduationCap}
              value={stats.validatedEnrollments.toLocaleString("fr-FR")}
              label="Inscriptions validées"
            />
            <StatCard
              icon={Wallet}
              value={formatFcfa(stats.totalDistributed)}
              label="Commissions versées"
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>
        </section>
      ) : null}

      <section id="comment" className="rounded-eig-lg border border-slate-200 bg-white p-6 md:p-8">
        <SectionHeading
          title="Comment ça marche"
          subtitle="Le parcours, de l'inscription au versement des commissions."
        />
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
          title="Niveaux ambassadeur"
          subtitle="Le palier dépend du nombre d'inscriptions validées sur votre code."
          align="center"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard key={tier} tier={tier} />
          ))}
        </div>
      </section>

      <section className="rounded-eig-lg bg-gradient-to-r from-eig-blue to-eig-blue-light p-6 text-center md:p-10">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">Créer votre compte ambassadeur</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-blue-100 md:text-base">
          L&apos;inscription est gratuite. Vous recevez votre code personnel dès la validation de votre e-mail.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/partenaires/inscription" variant="primary" size="lg">
            Commencer l&apos;inscription
          </Button>
          <Button href="/connexion" variant="outline" size="lg">
            Accéder à mon espace
          </Button>
          <DemoAccessButton size="lg" />
        </div>
      </section>
    </div>
  );
}
