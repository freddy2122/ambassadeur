"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Rule = {
  id: number;
  program_type: string;
  tier: "bronze" | "argent" | "or";
  min_enrollments: number;
  max_enrollments?: number | null;
  amount_per_enrollment: number;
};

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    program_type: "superieur",
    tier: "bronze",
    min_enrollments: 0,
    max_enrollments: "",
    amount_per_enrollment: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiRequest<{ data?: Rule[] }>("/admin/commission-rules", {}, true);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        return;
      }
      setError("");
      setRules(res.data?.data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await apiRequest("/admin/commission-rules", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        max_enrollments: form.max_enrollments ? Number(form.max_enrollments) : null,
      }),
    }, true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-[#0b2e7a]">Règles de commission</h1>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3">Programme</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">Min</th>
                <th className="py-2 pr-3">Max</th>
                <th className="py-2 pr-3">Montant/inscription</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{rule.program_type}</td>
                  <td className="py-2 pr-3">{rule.tier}</td>
                  <td className="py-2 pr-3">{rule.min_enrollments}</td>
                  <td className="py-2 pr-3">{rule.max_enrollments ?? "-"}</td>
                  <td className="py-2 pr-3">{Number(rule.amount_per_enrollment).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await apiRequest(`/admin/commission-rules/${rule.id}`, { method: "DELETE" }, true);
                        setRefreshKey((k) => k + 1);
                      }}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-[#0b2e7a]">Créer une règle</h2>
        <form className="mt-3 grid gap-2 md:grid-cols-5" onSubmit={onCreate}>
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.program_type} onChange={(e) => setForm({ ...form, program_type: e.target.value })} />
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
            <option value="bronze">bronze</option>
            <option value="argent">argent</option>
            <option value="or">or</option>
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" value={form.min_enrollments} onChange={(e) => setForm({ ...form, min_enrollments: Number(e.target.value) })} placeholder="Min" />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.max_enrollments} onChange={(e) => setForm({ ...form, max_enrollments: e.target.value })} placeholder="Max (optionnel)" />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" value={form.amount_per_enrollment} onChange={(e) => setForm({ ...form, amount_per_enrollment: Number(e.target.value) })} placeholder="Montant FCFA" />
          <button className="md:col-span-5 rounded-md bg-[#0b2e7a] px-3 py-2 text-sm font-semibold text-white" type="submit">
            Ajouter la règle
          </button>
        </form>
      </section>
    </div>
  );
}
