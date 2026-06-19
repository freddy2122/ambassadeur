"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { EarningsHistoryList } from "@/components/dashboard/EarningsHistoryList";
import { EarningsSummary } from "@/components/dashboard/EarningsSummary";
import { Button } from "@/components/ui/Button";
import type { EarningsResponse } from "@/lib/ambassador";
import { apiRequest } from "@/lib/api";
import { LoadingBlock } from "@/components/ui/LoadingState";

export default function CommissionsPage() {
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<EarningsResponse>("/me/earnings?limit=30", {}, true).then((res) => {
      if (res.error) setError(res.error);
      else setData(res.data ?? null);
      setLoading(false);
    });
  }, []);

  const earnings = data?.earnings ?? { available: 0, pending: 0, paid: 0 };

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="rounded-eig-lg border border-eig-blue bg-eig-blue p-6 text-white shadow-eig">
        <h1 className="text-2xl font-extrabold">Mes Gains</h1>
        <p className="mt-1 text-sm text-blue-100">Suis tes revenus disponibles, en attente et déjà versés.</p>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
      ) : null}

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <LoadingBlock label="Chargement de tes gains…" />
        </section>
      ) : (
        <>
          <EarningsSummary
            available={earnings.available ?? 0}
            pending={earnings.pending ?? 0}
            paid={earnings.paid ?? 0}
          />

          <section className="rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-eig-blue">Demander un retrait</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {(earnings.available ?? 0) > 0
                    ? "Tu peux retirer tes gains disponibles via Mobile Money."
                    : "Aucun gain disponible pour le moment."}
                </p>
              </div>
              {(earnings.available ?? 0) > 0 ? (
                <Button href="/dashboard/paiements" variant="secondary" size="md" className="gap-2">
                  Demander un retrait
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <span className="text-sm text-slate-500">Solde insuffisant</span>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-eig-blue">Historique</h2>
            <EarningsHistoryList items={data?.history ?? []} />
          </section>
        </>
      )}
    </div>
  );
}
