"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { SubmitButton } from "@/components/ui/LoadingState";
import { useClientSearchParamsSnapshot } from "@/lib/useClientSearchParamsSnapshot";

type ResetResponse = {
  message?: string;
};

export default function ResetPasswordPage() {
  const searchParams = useClientSearchParamsSnapshot();
  const emailFromUrl = searchParams.get("email") ?? "";
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await apiRequest<ResetResponse>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: email || emailFromUrl,
          token: token || tokenFromUrl,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      setMessage(res.data?.message ?? "Mot de passe réinitialisé avec succès.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-4 flex justify-center">
          <Image src="/favicon-32.png" alt="EIG" width={42} height={42} />
        </div>
        <h1 className="text-2xl font-bold text-[#0b2e7a]">Réinitialiser le mot de passe</h1>
        <p className="mt-1 text-sm text-slate-600">Collez le token reçu et définissez votre nouveau mot de passe.</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm"
            type="email"
            placeholder="Email"
            value={email || emailFromUrl}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm"
            placeholder="Token de réinitialisation"
            value={token || tokenFromUrl}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <div className="relative">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-10 text-sm"
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 pr-10 text-sm"
              type={showPasswordConfirmation ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
            >
              {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <SubmitButton
            loading={submitting}
            loadingLabel="Réinitialisation…"
            className="w-full rounded-md bg-[#0b2e7a] px-4 py-2.5 text-sm text-white"
          >
            Réinitialiser
          </SubmitButton>
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
