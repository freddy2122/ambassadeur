"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  formationSlug: string;
};

export function FormationCtaLinks({ formationSlug }: Props) {
  const ref = useSearchParams().get("ref");

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href={`/inscription?formation=${encodeURIComponent(formationSlug)}${
          ref ? `&code=${encodeURIComponent(ref)}` : ""
        }`}
        className="rounded-md bg-[#0b2e7a] px-4 py-2 text-sm font-semibold text-white"
      >
        S&apos;inscrire à cette formation
      </Link>
      <Link
        href={`/formations${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        Voir toutes les formations
      </Link>
    </div>
  );
}
