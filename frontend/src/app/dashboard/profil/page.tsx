"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type ProfileResponse = {
  profile?: {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    email_verified?: boolean;
    payment_method?: string;
    payment_account?: string;
    payment_bank_code?: string;
  };
};

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<ProfileResponse>("/me/profile", {}, true).then((res) => {
      if (res.data?.profile) {
        setProfile(res.data.profile);
        setForm({
          name: res.data.profile.name ?? "",
          email: res.data.profile.email ?? "",
          phone: res.data.profile.phone ?? "",
        });
      }
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    const res = await apiRequest<{
      message?: string;
      requires_verification?: boolean;
      email?: string;
    }>("/me/profile", {
      method: "PUT",
      body: JSON.stringify(form),
    }, true);

    if (res.error) {
      setError(res.error);
      return;
    }

    const msg = res.data?.message ?? "Profil mis à jour.";
    setMessage(msg);

    if (res.data?.requires_verification && res.data?.email) {
      router.push(`/verification?email=${encodeURIComponent(res.data.email)}`);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6">
      <h1 className="text-xl font-semibold text-[#0b2e7a]">Profil</h1>
      {!profile ? <p className="mt-3 text-sm text-slate-600">Chargement...</p> : null}
      {profile ? (
        <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${profile.email_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {profile.email_verified ? "Email vérifié" : "Email non vérifié"}
        </p>
      ) : null}
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="sm:col-span-2 text-sm text-emerald-700">{message}</p> : null}
        <div className="sm:col-span-2">
          <button className="rounded-md bg-[#0b2e7a] px-4 py-2 text-sm font-semibold text-white" type="submit">
            Enregistrer les modifications
          </button>
        </div>
      </form>
      {profile ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard label="Nom complet" value={profile.name} />
          <InfoCard label="Email" value={profile.email} />
          <InfoCard label="Téléphone" value={profile.phone} />
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || "Non renseigné"}</p>
    </div>
  );
}
