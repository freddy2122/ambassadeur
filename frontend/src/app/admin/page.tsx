"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { LoadingBlock, LoadingButton } from "@/components/ui/LoadingState";
import { BarChart3, CreditCard, GraduationCap, Users } from "lucide-react";

type AdminOverviewResponse = {
  kpis?: {
    ambassadors_total?: number;
    leads_total?: number;
    clicks_total?: number;
    validated_enrollments_total?: number;
    commissions_total_amount?: number;
    payouts_total_amount?: number;
  };
  ambassadors?: Array<{
    id: number;
    name?: string;
    email?: string;
    role?: string | null;
    leads_count?: number;
    clicks_count?: number;
    validated_enrollments?: number;
    commissions_total?: number;
    payouts_total?: number;
  }>;
  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    ambassadors: 0,
    leads: 0,
    commissionsAmount: 0,
    payoutsAmount: 0,
  });
  const [rows, setRows] = useState<AdminOverviewResponse["ambassadors"]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (search) params.set("search", search);
    apiRequest<AdminOverviewResponse>(`/admin/overview?${params.toString()}`, {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setStats({
        ambassadors: res.data?.kpis?.ambassadors_total ?? 0,
        leads: res.data?.kpis?.leads_total ?? 0,
        commissionsAmount: res.data?.kpis?.commissions_total_amount ?? 0,
        payoutsAmount: res.data?.kpis?.payouts_total_amount ?? 0,
      });
      setRows(res.data?.ambassadors ?? []);
      setLastPage(res.data?.meta?.last_page ?? 1);
      setLoading(false);
      setRefreshing(false);
    });
  }, [page, search, refreshKey]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-eig-blue bg-gradient-to-r from-[#0b2e7a] via-[#1144a6] to-eig-gold-dark p-6 text-white">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-blue-100">
          Vue globale des ambassadeurs et de leurs performances.
        </p>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ambassadeurs" value={stats.ambassadors} icon={<Users size={16} />} />
        <StatCard title="Leads" value={stats.leads} icon={<GraduationCap size={16} />} />
        <StatCard title="Commissions (FCFA)" value={stats.commissionsAmount} icon={<BarChart3 size={16} />} />
        <StatCard title="Paiements (FCFA)" value={stats.payoutsAmount} icon={<CreditCard size={16} />} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#0b2e7a]">Liste des partenaires ambassadeurs</h2>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => {
                setLoading(true);
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Rechercher nom/email"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <LoadingButton
              type="button"
              loading={refreshing}
              loadingLabel="Actualisation…"
              onClick={() => {
                setLoading(true);
                setRefreshing(true);
                setRefreshKey((k) => k + 1);
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Actualiser
            </LoadingButton>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-8">
              <LoadingBlock label="Chargement des ambassadeurs…" />
            </div>
          ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3">Ambassadeur</th>
                <th className="py-2 pr-3">Leads</th>
                <th className="py-2 pr-3">Clics</th>
                <th className="py-2 pr-3">Rôle</th>
                <th className="py-2 pr-3">Inscriptions validées</th>
                <th className="py-2 pr-3">Commissions</th>
                <th className="py-2 pr-3">Paiements</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <p>{row.name ?? "-"}</p>
                    <p className="text-xs text-slate-500">{row.email ?? "-"}</p>
                  </td>
                  <td className="py-2 pr-3">{row.leads_count ?? 0}</td>
                  <td className="py-2 pr-3">{row.clicks_count ?? 0}</td>
                  <td className="py-2 pr-3">{row.role ?? "partner"}</td>
                  <td className="py-2 pr-3">{row.validated_enrollments ?? 0}</td>
                  <td className="py-2 pr-3">{Number(row.commissions_total ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{Number(row.payouts_total ?? 0).toLocaleString("fr-FR")} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        {!loading && (rows?.length ?? 0) === 0 ? <p className="mt-3 text-sm text-slate-500">Aucun ambassadeur trouvé.</p> : null}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {page} / {lastPage}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }} disabled={page <= 1} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Précédent</button>
            <button type="button" onClick={() => {
              setLoading(true);
              setPage((p) => Math.min(lastPage, p + 1));
            }} disabled={page >= lastPage} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-[#0b2e7a]">Actions rapides admin</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/commissions" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Gérer commissions
          </Link>
          <Link href="/admin/payouts" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Gérer paiements
          </Link>
          <Link href="/admin/rules" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Gérer règles
          </Link>
          <Link href="/admin/formations-pricing" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Gérer tarifs
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#0b2e7a]">{Number(value).toLocaleString("fr-FR")}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f8ff] text-[#0b2e7a]">{icon}</div>
      </div>
    </article>
  );
}
