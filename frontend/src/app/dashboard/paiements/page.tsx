"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PayoutEligibilityResponse } from "@/lib/ambassador";
import { apiRequest } from "@/lib/api";
import { formatFcfa } from "@/lib/platformStats";

type PaymentMethod = "mtn" | "moov" | "celtiis";

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "mtn", label: "MTN" },
  { value: "moov", label: "Moov" },
  { value: "celtiis", label: "Celtiis" },
];

export default function PaiementsPage() {
  const [eligibility, setEligibility] = useState<PayoutEligibilityResponse | null>(null);
  const [form, setForm] = useState({
    amount: "",
    payment_method: "mtn" as PaymentMethod,
    payment_account: "",
    payment_account_holder: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    apiRequest<PayoutEligibilityResponse>("/me/payout-eligibility", {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        const payload = res.data ?? null;
        setEligibility(payload);
        const available = payload?.earnings?.available ?? payload?.eligible_total_xof ?? 0;
        const profile = payload?.payment_profile;
        setForm((prev) => ({
          ...prev,
          amount: available > 0 ? String(Math.round(available)) : "",
          payment_method: (profile?.payment_method as PaymentMethod) || prev.payment_method,
          payment_account: profile?.payment_account || profile?.phone || "",
          payment_account_holder: profile?.payment_account_holder || "",
        }));
      }
      setInitialLoading(false);
    });
  }, []);

  const available = eligibility?.earnings?.available ?? eligibility?.eligible_total_xof ?? 0;
  const blockers = eligibility?.blockers;
  const blocked = blockers?.email_verification_required ?? false;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Indique un montant valide.");
      return;
    }
    if (amount > available) {
      setError("Le montant dépasse ton solde disponible.");
      return;
    }
    if (!form.payment_account.trim()) {
      setError("Indique ton numéro Mobile Money.");
      return;
    }
    if (!form.payment_account_holder.trim()) {
      setError("Indique le nom du titulaire du compte.");
      return;
    }

    setLoading(true);
    const res = await apiRequest<{ message?: string }>(
      "/me/payout-requests",
      {
        method: "POST",
        body: JSON.stringify({
          amount,
          payment_method: form.payment_method,
          payment_account: form.payment_account.trim(),
          payment_account_holder: form.payment_account_holder.trim(),
        }),
      },
      true,
    );
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setMessage(res.data?.message ?? "Demande envoyée avec succès.");
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="rounded-eig-lg border border-slate-200 bg-white p-6 shadow-eig">
        <h1 className="text-2xl font-extrabold text-eig-blue">Retirer mes gains</h1>
        <p className="mt-1 text-sm text-eig-muted">Renseigne tes informations Mobile Money pour recevoir ton paiement.</p>
      </section>

      {initialLoading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Chargement...
        </section>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <section className="rounded-eig-lg border border-eig-cyan/20 bg-eig-cyan/5 p-5">
            <p className="text-sm font-semibold text-eig-blue">Montant disponible</p>
            <p className="mt-2 text-3xl font-extrabold text-eig-blue">{formatFcfa(available)}</p>
          </section>

          {blockers?.email_verification_required ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Vérifie ton adresse e-mail avant de demander un retrait.{" "}
              <Link href="/verification" className="font-semibold text-eig-blue underline">
                Vérifier mon e-mail
              </Link>
            </p>
          ) : null}

          <section className="rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Montant à retirer</span>
                <input
                  type="number"
                  min={1}
                  max={available || undefined}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-eig-cyan focus:ring-2 focus:ring-eig-cyan/20"
                  placeholder="Ex. 75000"
                  required
                />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">Mode de paiement</legend>
                <div className="mt-3 flex flex-wrap gap-4">
                  {paymentMethods.map((method) => (
                    <label key={method.value} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={form.payment_method === method.value}
                        onChange={() => setForm({ ...form, payment_method: method.value })}
                        className="h-4 w-4 accent-eig-blue"
                      />
                      {method.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Numéro Mobile Money</span>
                <input
                  type="tel"
                  value={form.payment_account}
                  onChange={(e) => setForm({ ...form, payment_account: e.target.value })}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-eig-cyan focus:ring-2 focus:ring-eig-cyan/20"
                  placeholder="+229 XX XX XX XX"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Nom du titulaire</span>
                <input
                  type="text"
                  value={form.payment_account_holder}
                  onChange={(e) => setForm({ ...form, payment_account_holder: e.target.value })}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-eig-cyan focus:ring-2 focus:ring-eig-cyan/20"
                  placeholder="Nom complet"
                  required
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={loading || available <= 0 || blocked}
                className="disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
              </Button>
              <Link
                href="/dashboard/commissions"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-eig-blue hover:bg-slate-50"
              >
                Retour aux gains
              </Link>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
