"use client";

import { Link2 } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { usePersonalReferralUrl } from "@/lib/usePersonalReferralUrl";

type ReferralCodeBlockProps = {
  code: string;
  /** Ignoré à l’affichage : conservé comme fallback SSR uniquement. */
  personalUrl?: string | null;
};

export function ReferralCodeBlock({ code, personalUrl }: ReferralCodeBlockProps) {
  const { link, host, ready } = usePersonalReferralUrl(code, personalUrl);

  return (
    <section className="rounded-eig-lg border border-eig-yellow/50 bg-eig-yellow-light/40 p-5 shadow-eig">
      <h3 className="text-base font-bold text-eig-blue">Mon Code Ambassadeur</h3>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-xl border border-eig-yellow/60 bg-eig-yellow-light px-4 py-2 text-lg font-extrabold tracking-wide text-eig-blue">
          {code}
        </span>
        <CopyButton value={code} label="Copier" />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-700">Mon Lien Personnel</h4>
        <p className="mt-1 text-xs text-eig-muted">
          {ready && host ? (
            <>
              Lien pour le domaine <span className="font-semibold text-eig-blue">{host}</span> — identique sur
              Partnext, Vercel ou en local, selon l’adresse où tu es connecté.
            </>
          ) : (
            <>Génération du lien pour ce domaine…</>
          )}
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-eig-yellow/40 bg-white px-3 text-sm text-slate-700">
            <Link2 size={16} className="shrink-0 text-eig-blue" />
            {ready ? (
              <span className="truncate">{link}</span>
            ) : (
              <span className="inline-flex items-center gap-2 text-eig-muted">
                <LoadingSpinner size={14} />
                Préparation du lien…
              </span>
            )}
          </div>
          <CopyButton value={link} label="Copier" disabled={!ready} />
        </div>
      </div>
    </section>
  );
}
