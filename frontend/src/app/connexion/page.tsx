"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  buildLoginRequestBody,
  homePathForRole,
  roleFromLoginResponse,
  saveAuthSession,
} from "@/lib/auth/session";
import { isDemoMode, DEMO_LOGIN_HINT } from "@/lib/demo/config";
import { SubmitButton } from "@/components/ui/LoadingState";

type LoginResponse = {
  token?: string;
  message?: string;
  requires_verification?: boolean;
  email?: string;
  user?: { role?: string | null };
};

export default function ConnexionPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: buildLoginRequestBody(login, password),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data?.requires_verification) {
        const email = result.data.email ?? (login.includes("@") ? login : "");
        router.push(`/verification?email=${encodeURIComponent(email)}`);
        return;
      }

      if (result.data?.token) {
        const role = roleFromLoginResponse(result.data.user);
        saveAuthSession(result.data.token, role);
        router.push(homePathForRole(role));
        return;
      }

      setError("Réponse du serveur inattendue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden lg:block">
        <Image
          src="/formations/stream-licence-pro.png"
          alt="EIG"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-eig-blue/80" />
        <div className="absolute inset-0 flex items-end p-10 text-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-eig-cyan-light">EIG Ambassadors</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight">Connexion</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">
              Un seul identifiant pour tous les comptes. Vous êtes redirigé vers l&apos;espace ambassadeur
              ou l&apos;administration selon votre profil.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center bg-slate-50 p-6 md:p-10">
        <div className="w-full max-w-md rounded-eig-lg border border-slate-200 bg-white p-6 shadow-eig md:p-8">
          <div className="mb-4 flex justify-center">
            <Image src="/favicon-32.png" alt="EIG" width={42} height={42} />
          </div>
          <h1 className="text-2xl font-bold text-eig-blue">Connexion</h1>
          <p className="mt-1 text-sm text-slate-600">
            E-mail ou téléphone (ambassadeurs). Les comptes admin utilisent leur e-mail professionnel.
          </p>

          {isDemoMode ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Aperçu : ambassadeur {DEMO_LOGIN_HINT.email} — admin : adresse contenant « admin »
            </p>
          ) : null}

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-eig-cyan focus:ring-2 focus:ring-eig-cyan/20"
              type="text"
              placeholder="E-mail ou téléphone"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoComplete="username"
            />
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-eig-cyan focus:ring-2 focus:ring-eig-cyan/20"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
            <div className="text-right">
              <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-eig-blue hover:underline">
                Mot de passe oublié
              </Link>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <SubmitButton
              loading={submitting}
              loadingLabel="Connexion en cours…"
              className="w-full rounded-xl bg-eig-blue px-4 py-2.5 text-sm text-white ring-1 ring-eig-yellow/45 hover:bg-eig-blue-light"
            >
              Se connecter
            </SubmitButton>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Pas encore ambassadeur ?{" "}
            <Link href="/partenaires/inscription" className="font-semibold text-eig-blue hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
