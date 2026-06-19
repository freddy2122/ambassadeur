"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { LoadingBlock, LoadingButton } from "@/components/ui/LoadingState";

type Payout = {
  id: number;
  amount?: number;
  method?: string;
  status?: string;
  provider_reference?: string;
  commission_id?: number;
  ambassador?: { name?: string; email?: string };
};

type PaginatedResponse = {
  data?: {
    data?: Payout[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

export default function AdminPayoutsPage() {
  const [items, setItems] = useState<Payout[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [commissionIds, setCommissionIds] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (status) params.set("status", status);
    apiRequest<PaginatedResponse>(`/admin/payouts?${params.toString()}`, {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setError("");
        setItems(res.data?.data?.data ?? []);
        setLastPage(res.data?.data?.last_page ?? 1);
        setTotal(res.data?.data?.total ?? 0);
      }
      setLoading(false);
    });
  }, [page, status]);

  async function onTrigger() {
    const ids = commissionIds
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (!ids.length || triggering) return;
    setTriggering(true);
    try {
      await apiRequest("/admin/payouts/trigger", {
        method: "POST",
        body: JSON.stringify({ commission_ids: ids }),
      }, true);
      setPage(1);
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-xl font-bold text-[#0b2e7a]">Paiements</h1>
      <p className="mt-1 text-sm text-slate-600">Total: {total}</p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="processing">processing</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
        <input
          value={commissionIds}
          onChange={(e) => setCommissionIds(e.target.value)}
          placeholder="IDs commissions (ex: 1,2,3)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <LoadingButton
          type="button"
          loading={triggering}
          loadingLabel="Envoi…"
          onClick={onTrigger}
          disabled={!commissionIds.trim()}
          className="rounded-md bg-[#0b2e7a] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Déclencher paiements
        </LoadingButton>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="mt-6">
          <LoadingBlock label="Chargement des paiements…" />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3">Ambassadeur</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 pr-3">Méthode</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3">Commission</th>
                <th className="py-2">Référence</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <p>{item.ambassador?.name ?? "-"}</p>
                    <p className="text-xs text-slate-500">{item.ambassador?.email ?? "-"}</p>
                  </td>
                  <td className="py-2 pr-3">{(item.amount ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{item.method ?? "-"}</td>
                  <td className="py-2 pr-3">{item.status ?? "-"}</td>
                  <td className="py-2 pr-3">#{item.commission_id ?? "-"}</td>
                  <td className="py-2">{item.provider_reference ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Page {page} / {lastPage}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Précédent</button>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage || loading} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Suivant</button>
        </div>
      </div>
    </div>
  );
}
