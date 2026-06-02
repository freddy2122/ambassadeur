"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const RAISONS: Record<string, string> = {
  reference_manquante: "La référence de dossier était absente après le paiement.",
  lead_introuvable: "Ce dossier n’a pas été retrouvé. Contactez l’école avec votre mail de paiement.",
  verification: "Le paiement n’a pas été confirmé (annulé, en attente ou refusé). Si vous avez été débité·e, gardez le reçu FedaPay et contactez nous.",
};

function PaiementEchecContent() {
  const searchParams = useSearchParams();
  const raison = searchParams.get("raison") ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f8eef0] via-white to-[#e8eef9] px-6 py-12 text-center">
      <Link href="/" className="mb-10">
        <Image src="/eig-logo.svg" alt="EIG" width={120} height={48} priority className="h-11 w-auto" />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-amber-200/70 bg-white/95 p-8 shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-[#0b2e7a] md:text-2xl">Paiement non finalisé</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {RAISONS[raison] ??
            "Le retour depuis FedaPay n’a pas permis de valider le paiement. Vous pouvez réessayer depuis le lien d’inscription envoyé par votre référent."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/formations"
            className="inline-flex justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Formations
          </Link>
          <Link
            href="mailto:contact@eiggroupe.com"
            className="inline-flex justify-center rounded-lg bg-[#0b2e7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092563]"
          >
            Nous écrire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaiementEchecPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8eef0] to-white px-6 text-sm text-slate-600">
          Chargement…
        </div>
      }
    >
      <PaiementEchecContent />
    </Suspense>
  );
}
