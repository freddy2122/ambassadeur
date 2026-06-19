"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  formationCategories,
  formations,
  getFormationPricingFallback,
  type Formation,
} from "@/lib/formations";

type PricingItem = {
  slug: string;
  title: string;
  base_price?: number | null;
  discount_price?: number | null;
  registration_fee?: number | null;
  is_active?: boolean;
};

type Props = {
  pricingCatalog: PricingItem[];
};

export function FormationsListing({ pricingCatalog }: Props) {
  const params = useSearchParams();
  const selected = params.get("category") ?? undefined;
  const ref = params.get("ref");

  const pricingBySlug = useMemo(
    () => new Map(pricingCatalog.map((item) => [item.slug, item])),
    [pricingCatalog]
  );

  const withRef = (href: string) =>
    ref ? `${href}${href.includes("?") ? "&" : "?"}ref=${encodeURIComponent(ref)}` : href;

  const filtered: Formation[] =
    selected && selected.trim() !== ""
      ? formations.filter((formation) => formation.category === selected)
      : formations;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-eig-yellow/40 bg-white p-4 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-eig-blue">Catalogue EIG</p>
        <h1 className="mt-1 text-2xl font-extrabold text-eig-blue">Nos formations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choisissez un parcours orienté pratique et employabilité.
        </p>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {formationCategories.map((cat) => (
            <Link
              key={cat.id}
              href={withRef(`/formations?category=${cat.id}`)}
              className={`rounded-md border px-3 py-2 text-sm font-medium hover:bg-eig-yellow-light/60 ${
                selected === cat.id
                  ? "border-eig-blue bg-eig-blue text-white ring-1 ring-eig-yellow/50"
                  : "border-eig-yellow/40 bg-eig-yellow-light/30 text-slate-700"
              }`}
            >
              {cat.label}
            </Link>
          ))}
          <Link
            href={withRef("/formations")}
            className={`rounded-md border px-3 py-2 text-sm font-medium hover:bg-eig-yellow-light/60 ${
              !selected
                ? "border-eig-blue bg-eig-blue text-white ring-1 ring-eig-yellow/50"
                : "border-eig-yellow/40 bg-eig-yellow-light/30 text-slate-700"
            }`}
          >
            Toutes les formations
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((formation) => {
          const pricing = pricingBySlug.get(formation.slug);
          const fb = getFormationPricingFallback(formation);
          const displayedPrice =
            Number(pricing?.discount_price ?? pricing?.base_price ?? fb.annualFcfa) || 0;
          const crossedBase =
            pricing?.discount_price != null &&
            pricing?.base_price != null &&
            pricing.base_price !== pricing.discount_price
              ? Number(pricing.base_price)
              : null;
          return (
            <article
              key={formation.slug}
              className="overflow-hidden rounded-2xl border border-eig-yellow/35 bg-white shadow-sm"
            >
              <Image
                src={formation.imageUrl}
                alt={formation.title}
                width={640}
                height={260}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-eig-blue">
                  {formation.category} · {formation.duration}
                </p>
                <h2 className="mt-1 text-lg font-bold text-eig-blue">{formation.title}</h2>
                <p className="mt-2 text-sm text-slate-700">{formation.excerpt}</p>
                <p className="mt-2 text-sm font-bold text-eig-blue">
                  {displayedPrice.toLocaleString("fr-FR")} FCFA
                  {crossedBase != null ? (
                    <span className="ml-2 text-xs font-medium text-slate-500 line-through">
                      {crossedBase.toLocaleString("fr-FR")} FCFA
                    </span>
                  ) : null}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {formation.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-eig-yellow-light px-2 py-1 text-xs font-medium text-eig-blue ring-1 ring-eig-yellow/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  href={withRef(`/formations/${formation.slug}`)}
                  className="mt-4 inline-flex rounded-md bg-eig-blue px-3 py-2 text-sm font-semibold text-white ring-1 ring-eig-yellow/45 hover:bg-eig-blue-light"
                >
                  Voir le détail
                </Link>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune formation dans cette catégorie.</p>
        ) : null}
      </section>
    </div>
  );
}
