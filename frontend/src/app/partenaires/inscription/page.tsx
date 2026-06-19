"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { homePathForRole, roleFromLoginResponse, saveAuthSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { SubmitButton } from "@/components/ui/LoadingState";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    email: "",
    phone_country_code: "+229",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      if (form.password !== form.password_confirmation) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      const payload = {
        name: `${form.last_name} ${form.first_name}`.trim(),
        email: form.email,
        phone: `${form.phone_country_code}${form.phone}`.replace(/\s+/g, ""),
        password: form.password,
      };

      const res = await apiRequest<{ token?: string; message?: string; user?: { role?: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (isDemoMode && res.data?.token) {
        const role = roleFromLoginResponse(res.data.user);
        saveAuthSession(res.data.token, role);
        router.push(homePathForRole(role));
        return;
      }
      router.push(`/verification?email=${encodeURIComponent(form.email)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden lg:block">
        <Image
          src="/formations/stream-formation-certifiante.png"
          alt="Programme partenaire EIG"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0b2e7a]/75" />
        <div className="absolute inset-0 flex items-end p-10 text-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Programme Ambassadeur</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight">Rejoignez l&apos;écosystème des partenaires EIG</h2>
            <p className="mt-3 max-w-md text-sm text-white/90">
              Inscrivez-vous en quelques minutes et commencez à recommander les formations EIG.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center bg-slate-50 p-6 md:p-10">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex justify-center">
            <Image src="/favicon-32.png" alt="EIG" width={42} height={42} />
          </div>
          <h1 className="text-2xl font-bold text-[#0b2e7a]">Inscription partenaire</h1>
          <p className="mt-1 text-sm text-slate-600">Créez votre compte pour accéder au programme ambassadeur.</p>

          <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Nom"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Prénom"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-[170px_1fr]">
              <select
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm"
                value={form.phone_country_code}
                onChange={(e) => setForm({ ...form, phone_country_code: e.target.value })}
              >
                <option value="+229">🇧🇯 +229</option>
                <option value="+225">🇨🇮 +225</option>
                <option value="+228">🇹🇬 +228</option>
                <option value="+221">🇸🇳 +221</option>
                <option value="+237">🇨🇲 +237</option>
              </select>
              <input
                className="rounded-md border border-slate-300 px-3 py-2.5 text-sm"
                placeholder="Téléphone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="relative">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-10 text-sm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-10 text-sm"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Confirmer mot de passe"
                  required
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
                  aria-label={showPasswordConfirmation ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <SubmitButton
              loading={submitting}
              loadingLabel="Création du compte…"
              className="mt-1 w-full rounded-md bg-[#0b2e7a] px-4 py-2.5 text-sm text-white"
            >
              Créer le compte
            </SubmitButton>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold text-[#0b2e7a] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
