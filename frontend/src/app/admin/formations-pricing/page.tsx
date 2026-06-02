"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Pricing = {
  id: number;
  slug: string;
  title: string;
  base_price?: number | null;
  discount_price?: number | null;
  registration_fee?: number | null;
  is_active?: boolean;
};

export default function AdminFormationsPricingPage() {
  const [items, setItems] = useState<Pricing[]>([]);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    base_price: "",
    discount_price: "",
    registration_fee: "",
    is_active: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiRequest<{ data?: Pricing[] }>("/admin/formation-pricings", {}, true);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        return;
      }
      setError("");
      setItems(res.data?.data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await apiRequest("/admin/formation-pricings", {
      method: "POST",
      body: JSON.stringify({
        slug: form.slug,
        title: form.title,
        base_price: form.base_price ? Number(form.base_price) : null,
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        registration_fee: form.registration_fee ? Number(form.registration_fee) : null,
        is_active: form.is_active,
      }),
    }, true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-[#0b2e7a]">Tarifs formations</h1>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3">Formation</th>
                <th className="py-2 pr-3">Prix normal</th>
                <th className="py-2 pr-3">Prix promo</th>
                <th className="py-2 pr-3">Frais inscription</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <p>{item.title}</p>
                    <p className="text-xs text-slate-500">{item.slug}</p>
                  </td>
                  <td className="py-2 pr-3">{Number(item.base_price ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{Number(item.discount_price ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{Number(item.registration_fee ?? 0).toLocaleString("fr-FR")} FCFA</td>
                  <td className="py-2 pr-3">{item.is_active ? "Actif" : "Inactif"}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await apiRequest(`/admin/formation-pricings/${item.id}`, { method: "DELETE" }, true);
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
        <h2 className="text-base font-bold text-[#0b2e7a]">Ajouter un tarif</h2>
        <form onSubmit={onCreate} className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Titre formation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={form.is_active ? "1" : "0"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })}>
            <option value="1">Actif</option>
            <option value="0">Inactif</option>
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" placeholder="Prix normal" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" placeholder="Prix promo" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
          <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" type="number" placeholder="Frais inscription" value={form.registration_fee} onChange={(e) => setForm({ ...form, registration_fee: e.target.value })} />
          <button type="submit" className="md:col-span-3 rounded-md bg-[#0b2e7a] px-3 py-2 text-sm font-semibold text-white">Créer tarif</button>
        </form>
      </section>
    </div>
  );
}
