"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type PayoutRun = {
  id: number;
  command?: string;
  period_month?: string | null;
  status?: string;
  success_count?: number;
  failed_count?: number;
  skipped_count?: number;
  unchanged_count?: number;
  error_message?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
};

type RunsResponse = {
  summary?: {
    success_rate?: number;
    total_success?: number;
    total_failed?: number;
    total_runs?: number;
    pending_retries?: number;
  };
  data?: {
    data?: PayoutRun[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

export default function AdminPayoutsAutoPage() {
  const [rows, setRows] = useState<PayoutRun[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState("");
  const [command, setCommand] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    success_rate: 0,
    total_success: 0,
    total_failed: 0,
    total_runs: 0,
    pending_retries: 0,
  });

  const applyFilters = (next: { command?: string; status?: string }) => {
    setPage(1);
    if (next.command !== undefined) setCommand(next.command);
    if (next.status !== undefined) setStatus(next.status);
  };

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (status) params.set("status", status);
    if (command) params.set("command", command);

    apiRequest<RunsResponse>(`/admin/payout-runs?${params.toString()}`, {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
        return;
      }
      setError("");
      setRows(res.data?.data?.data ?? []);
      setLastPage(res.data?.data?.last_page ?? 1);
      setSummary({
        success_rate: res.data?.summary?.success_rate ?? 0,
        total_success: res.data?.summary?.total_success ?? 0,
        total_failed: res.data?.summary?.total_failed ?? 0,
        total_runs: res.data?.summary?.total_runs ?? 0,
        pending_retries: res.data?.summary?.pending_retries ?? 0,
      });
    });
  }, [page, status, command]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h1 className="text-xl font-bold text-[#0b2e7a]">Etat des payouts automatiques</h1>
      <p className="mt-1 text-sm text-slate-600">Suivi des exécutions auto-run, retry et reconcile.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters({ command: "", status: "done" })}
          className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition-opacity hover:opacity-85"
        >
          Taux de succès: {Number(summary.success_rate).toLocaleString("fr-FR")}%
        </button>
        <button
          type="button"
          onClick={() => applyFilters({ status: "done" })}
          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition-opacity hover:opacity-85"
        >
          Succès: {summary.total_success}
        </button>
        <button
          type="button"
          onClick={() => applyFilters({ status: "skipped" })}
          className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition-opacity hover:opacity-85"
        >
          Échecs: {summary.total_failed}
        </button>
        <button
          type="button"
          onClick={() => applyFilters({ command: "", status: "" })}
          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition-opacity hover:opacity-85"
        >
          Runs: {summary.total_runs}
        </button>
        <button
          type="button"
          onClick={() => applyFilters({ command: "payouts:retry-failed", status: "" })}
          className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition-opacity hover:opacity-85"
        >
          Retries en attente: {summary.pending_retries}
        </button>
        {(status || command) ? (
          <button
            type="button"
            onClick={() => applyFilters({ command: "", status: "" })}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-opacity hover:opacity-85"
          >
            Réinitialiser filtres
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <select value={command} onChange={(e) => { setPage(1); setCommand(e.target.value); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Toutes les commandes</option>
          <option value="payouts:auto-run">payouts:auto-run</option>
          <option value="payouts:reconcile">payouts:reconcile</option>
          <option value="payouts:retry-failed">payouts:retry-failed</option>
        </select>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="running">running</option>
          <option value="done">done</option>
          <option value="skipped">skipped</option>
          <option value="error">error</option>
        </select>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Commande</th>
              <th className="py-2 pr-3">Periode</th>
              <th className="py-2 pr-3">Statut</th>
              <th className="py-2 pr-3">Succes</th>
              <th className="py-2 pr-3">Echecs</th>
              <th className="py-2 pr-3">Skips</th>
              <th className="py-2 pr-3">Unchanged</th>
              <th className="py-2 pr-3">Debut</th>
              <th className="py-2">Fin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b ${
                  row.status === "running"
                    ? "border-blue-100 bg-blue-50/60"
                    : row.status === "done"
                      ? "border-emerald-100 bg-emerald-50/60"
                      : row.status === "skipped"
                        ? "border-amber-100 bg-amber-50/60"
                        : row.status === "error"
                          ? "border-red-100 bg-red-50/60"
                          : "border-slate-100"
                }`}
              >
                <td className="py-2 pr-3">{row.command ?? "-"}</td>
                <td className="py-2 pr-3">{row.period_month ?? "-"}</td>
                <td className="py-2 pr-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      row.status === "running"
                        ? "bg-blue-100 text-blue-700"
                        : row.status === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "skipped"
                            ? "bg-amber-100 text-amber-700"
                            : row.status === "error"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {row.status ?? "-"}
                  </span>
                </td>
                <td className="py-2 pr-3">{row.success_count ?? 0}</td>
                <td className="py-2 pr-3">{row.failed_count ?? 0}</td>
                <td className="py-2 pr-3">{row.skipped_count ?? 0}</td>
                <td className="py-2 pr-3">{row.unchanged_count ?? 0}</td>
                <td className="py-2 pr-3">{row.started_at ? new Date(row.started_at).toLocaleString("fr-FR") : "-"}</td>
                <td className="py-2">{row.finished_at ? new Date(row.finished_at).toLocaleString("fr-FR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Page {page} / {lastPage}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Precedent</button>
          <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">Suivant</button>
        </div>
      </div>
    </div>
  );
}
