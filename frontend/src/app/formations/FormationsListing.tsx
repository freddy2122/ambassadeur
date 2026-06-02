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
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <h1 className="text-2xl font-extrabold text-[#0b2e7a]">Nos formations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choisissez un parcours orienté pratique et employabilité.
        </p>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {formationCategories.map((cat) => (
            <Link
              key={cat.id}
              href={withRef(`/formations?category=${cat.id}`)}
              className={`rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100 ${
                selected === cat.id
                  ? "border-[#0b2e7a] bg-[#0b2e7a] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {cat.label}
            </Link>
          ))}
          <Link
            href={withRef("/formations")}
            className={`rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100 ${
              !selected
                ? "border-[#0b2e7a] bg-[#0b2e7a] text-white"
                : "border-slate-200 bg-slate-50 text-slate-700"
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
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src={formation.imageUrl}
                alt={formation.title}
                width={640}
                height={260}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#16aee5]">
                  {formation.category} · {formation.duration}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#0b2e7a]">{formation.title}</h2>
                <p className="mt-2 text-sm text-slate-700">{formation.excerpt}</p>
                <p className="mt-2 text-sm font-bold text-[#0b2e7a]">
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
                      className="rounded-full bg-[#e8f8ff] px-2 py-1 text-xs font-medium text-[#0b2e7a]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  href={withRef(`/formations/${formation.slug}`)}
                  className="mt-4 inline-flex rounded-md bg-[#0b2e7a] px-3 py-2 text-sm font-semibold text-white"
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
