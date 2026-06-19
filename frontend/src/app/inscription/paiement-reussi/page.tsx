"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaiementReussiContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead_id");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#e8eef9] via-white to-[#dff6fc] px-6 py-12 text-center">
      <Link href="/" className="mb-10">
        <Image src="/eig-logo.svg" alt="EIG" width={120} height={48} priority className="h-11 w-auto" />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-emerald-200/70 bg-white/95 p-8 shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-[#0b2e7a] md:text-2xl">Paiement reçu</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Vos frais d&apos;inscription ont été pris en compte. Votre dossier peut être étudié par l&apos;équipe
          admissions.
        </p>
        {leadId ? <p className="mt-3 font-mono text-xs text-slate-500">Référence dossier&nbsp;: #{leadId}</p> : null}
        <Link
          href="/formations"
          className="mt-8 inline-flex rounded-lg bg-[#0b2e7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#092563]"
        >
          Retour aux formations
        </Link>
      </div>
    </div>
  );
}

export default function PaiementReussiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8eef9] to-white px-6 text-sm text-slate-600">
          Chargement…
        </div>
      }
    >
      <PaiementReussiContent />
    </Suspense>
  );
}
