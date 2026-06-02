import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formations, getFormationBySlug, getFormationPricingFallback } from "@/lib/formations";
import { fetchFormationPricingCatalog } from "@/lib/catalogApi";
import { FormationCtaLinks } from "@/app/formations/FormationCtaLinks";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return formations.map((formation) => ({ slug: formation.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);

  if (!formation) {
    return { title: "Formation introuvable" };
  }

  return {
    title: `${formation.title} | EIG`,
    description: formation.excerpt,
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pricingCatalog = await fetchFormationPricingCatalog();
  const pricing = pricingCatalog.find((item) => item.slug === slug);
  const formation = getFormationBySlug(slug);

  if (!formation) {
    notFound();
  }

  const generatedCareers = formation.skills.map((skill) => `${skill} (niveau professionnel)`);
  const generatedCurriculum = [
    {
      title: "Fondamentaux",
      items: [
        "Culture générale et communication",
        "Méthodologie de travail et outils numériques",
      ],
    },
    {
      title: "Compétences métier",
      items: formation.skills.map((skill) => `Atelier pratique : ${skill}`),
    },
    {
      title: "Professionnalisation",
      items: [
        "Projet fil rouge et cas réels",
        "Coaching insertion professionnelle",
      ],
    },
  ];

  const fallbackPrice = getFormationPricingFallback(formation);
  const details = formation.details ?? {
    careers: generatedCareers,
    objective:
      "Cette formation est orientée pratique et employabilité, avec une montée en compétence progressive vers les besoins du marché.",
    curriculum: generatedCurriculum,
    annualCostFcfa: fallbackPrice.annualFcfa,
    registrationFeeFcfa: fallbackPrice.registrationFcfa,
  };
  const annualCostFcfa = pricing?.discount_price ?? pricing?.base_price ?? details.annualCostFcfa;
  const registrationFeeFcfa = pricing?.registration_fee ?? details.registrationFeeFcfa;

  return (
    <div className="space-y-6">
      <Link href="/formations" className="inline-flex text-sm font-medium text-[#0b2e7a] hover:underline">
        ← Retour aux formations
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Image
          src={formation.imageUrl}
          alt={formation.title}
          width={1280}
          height={520}
          className="h-64 w-full object-cover md:h-80"
          priority
        />

        <div className="p-5 md:p-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#16aee5]">
            {formation.category} · {formation.duration}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#0b2e7a]">{formation.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-700">{formation.excerpt}</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-[#0b2e7a]">Débouchés</h2>
                <p className="mt-2 text-sm text-slate-700">{details.careers.join(" | ")}</p>
              </section>
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-[#0b2e7a]">Objectifs de la formation</h2>
                <p className="mt-2 text-sm text-slate-700">{details.objective}</p>
              </section>
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-[#0b2e7a]">Contenu de la formation</h2>
                <div className="mt-3 space-y-3">
                  {details.curriculum.map((block) => (
                    <div key={block.title}>
                      <p className="text-sm font-semibold text-slate-800">{block.title}</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <section className="rounded-xl border border-slate-200 bg-[#f5f9ff] p-4">
                <h2 className="text-lg font-bold text-[#0b2e7a]">Coût de la formation</h2>
                <p className="mt-2 text-base font-extrabold text-slate-800">
                  {(annualCostFcfa ?? 0).toLocaleString("fr-FR")} FCFA / an
                </p>
                {pricing?.discount_price != null &&
                pricing?.base_price != null &&
                Number(pricing.base_price) !== Number(pricing.discount_price) ? (
                  <p className="text-xs text-slate-500 line-through">
                    {Number(pricing.base_price).toLocaleString("fr-FR")} FCFA / an
                  </p>
                ) : null}
                <p className="text-sm font-bold text-slate-700">
                  Frais d&apos;inscription : {(registrationFeeFcfa ?? 0).toLocaleString("fr-FR")} FCFA
                </p>
              </section>
            </aside>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <section className="rounded-xl bg-slate-50 p-4">
              <h2 className="text-lg font-bold text-[#0b2e7a]">Compétences visées</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {formation.skills.map((skill) => (
                  <li key={skill}>• {skill}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl bg-[#e8f8ff] p-4">
              <h2 className="text-lg font-bold text-[#0b2e7a]">Infos pratiques</h2>
              <p className="mt-2 text-sm text-slate-700">Durée : {formation.duration}</p>
              <p className="text-sm text-slate-700">Niveau : Professionnel</p>
              <p className="text-sm text-slate-700">Format : Présentiel / Projet</p>
            </section>
          </div>

          <Suspense
            fallback={
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-block min-h-[2.75rem] w-48 animate-pulse rounded-md bg-slate-200" />
              </div>
            }
          >
            <FormationCtaLinks formationSlug={formation.slug} />
          </Suspense>
        </div>
      </article>
    </div>
  );
}
