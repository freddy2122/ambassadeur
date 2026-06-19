"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { LoadingBlock, LoadingButton } from "@/components/ui/LoadingState";

type Commission = {
  id: number;
  period_month?: string;
  validated_enrollments?: number;
  gross_amount?: number;
  tier?: string;
  status?: string;
  ambassador?: { name?: string; email?: string };
};

type PaginatedResponse = {
  data?: {
    data?: Commission[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

export default function AdminCommissionsPage() {
  const [items, setItems] = useState<Commission[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: "10",
    });
    if (status) params.set("status", status);
    if (periodMonth) params.set("period_month", periodMonth);

    apiRequest<PaginatedResponse>(`/admin/commissions?${params.toString()}`, {}, true).then((res) => {
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
  }, [page, status, periodMonth, refreshKey]);

  async function onGenerate() {
    if (!periodMonth || generating) return;
    setGenerating(true);
    try {
      await apiRequest("/admin/commissions/generate", {
        method: "POST",
        body: JSON.stringify({ period_month: periodMonth }),
      }, true);
      setPage(1);
      setRefreshKey((k) => k + 1);
    } finally {
      setGenerating(false);
    }
  }

  async function onApprove(id: number) {
    if (approvingId !== null) return;
    setApprovingId(id);
    try {
      await apiRequest(`/admin/commissions/${id}/approve`, { method: "POST" }, true);
      setRefreshKey((k) => k + 1);
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-xl font-bold text-[#0b2e7a]">Commissions</h1>
      <p className="mt-1 text-sm text-slate-600">Total: {total}</p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <input
          value={periodMonth}
          onChange={(e) => {
            setPage(1);
            setPeriodMonth(e.target.value);
          }}
          placeholder="Période (YYYY-MM)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="in_payment">in_payment</option>
          <option value="payment_failed">payment_failed</option>
        </select>
        <LoadingButton
          type="button"
          loading={generating}
          loadingLabel="Génération…"
          onClick={onGenerate}
          disabled={!periodMonth}
          className="rounded-md bg-[#0b2e7a] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Générer la période
        </LoadingButton>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="mt-6">
          <LoadingBlock label="Chargement des commissions…" />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3">Ambassadeur</th>
                <th className="py-2 pr-3">Période</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <p>{item.ambassador?.name ?? "-"}</p>
                    <p className="text-xs text-slate-500">{item.ambassador?.email ?? "-"}</p>
                  </td>
                  <td className="py-2 pr-3">{item.period_month ?? "-"}</td>
                  <td className="py-2 pr-3">{(item.gross_amount ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{item.tier ?? "-"}</td>
                  <td className="py-2 pr-3">{item.status ?? "-"}</td>
                  <td className="py-2">
                    {item.status !== "approved" ? (
                      <LoadingButton
                        type="button"
                        loading={approvingId === item.id}
                        loadingLabel="…"
                        onClick={() => onApprove(item.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Approuver
                      </LoadingButton>
                    ) : (
                      <span className="text-xs text-emerald-700">Approuvée</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Page {page} / {lastPage}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage || loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
