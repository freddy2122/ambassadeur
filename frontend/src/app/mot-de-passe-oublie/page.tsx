"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type ForgotResponse = {
  message?: string;
  debug_reset_token?: string | null;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugToken, setDebugToken] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugToken(null);

    const res = await apiRequest<ForgotResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.error) {
      setError(res.error);
      return;
    }

    setMessage(res.data?.message ?? "Si cet email existe, un lien de réinitialisation a été envoyé.");
    setDebugToken(res.data?.debug_reset_token ?? null);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-4 flex justify-center">
          <Image src="/favicon-32.png" alt="EIG" width={42} height={42} />
        </div>
        <h1 className="text-2xl font-bold text-[#0b2e7a]">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-600">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {debugToken ? (
            <p className="text-xs text-slate-500">
              Token debug: <span className="font-mono">{debugToken}</span>
            </p>
          ) : null}
          <button
            className="w-full rounded-md bg-[#0b2e7a] px-4 py-2.5 text-sm font-semibold text-white"
            type="submit"
          >
            Envoyer le lien
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Retour à{" "}
          <Link href="/connexion" className="font-semibold text-[#0b2e7a] hover:underline">
            la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
