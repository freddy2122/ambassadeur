"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest, setToken } from "@/lib/api";
import { isDemoMode } from "@/lib/demo/config";
import { DEMO_LOGIN_HINT } from "@/lib/demo/config";

type LoginResponse = {
  token?: string;
  message?: string;
  requires_verification?: boolean;
};

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const result = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data?.requires_verification) {
      router.push(`/verification?email=${encodeURIComponent(email)}`);
      return;
    }

    if (result.data?.token) {
      setToken(result.data.token);
      router.push("/dashboard");
      return;
    }

    setError("Reponse inattendue.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden lg:block">
        <Image
          src="https://eiggroupe.com/wp-content/uploads/2025/04/stream-licence-pro.png"
          alt="Ambassadeur EIG"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0b2e7a]/75" />
        <div className="absolute inset-0 flex items-end p-10 text-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">EIG Ambassadeur</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight">Accédez à votre espace partenaire</h2>
            <p className="mt-3 max-w-md text-sm text-white/90">
              Suivez vos leads, vos commissions et vos performances dans une interface dédiée.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center bg-slate-50 p-6 md:p-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex justify-center">
            <Image src="/favicon-32.png" alt="EIG" width={42} height={42} />
          </div>
          <h1 className="text-2xl font-bold text-[#0b2e7a]">Connexion partenaire</h1>
          <p className="mt-1 text-sm text-slate-600">Connectez-vous pour gérer votre activité ambassadeur.</p>

          {isDemoMode ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Mode démo : utilisez n&apos;importe quel e-mail et mot de passe, ou{" "}
              <span className="font-mono font-semibold">{DEMO_LOGIN_HINT.email}</span> /{" "}
              <span className="font-mono font-semibold">{DEMO_LOGIN_HINT.password}</span>
            </p>
          ) : null}

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-10 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-[#0b2e7a] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="w-full rounded-md bg-[#0b2e7a] px-4 py-2.5 text-sm font-semibold text-white" type="submit">
              Se connecter
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <Link href="/partenaires/inscription" className="font-semibold text-[#0b2e7a] hover:underline">
              Créer un compte partenaire
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
