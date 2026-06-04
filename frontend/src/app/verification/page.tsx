"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  homePathForRole,
  roleFromLoginResponse,
  saveAuthSession,
} from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { useClientSearchParamsSnapshot } from "@/lib/useClientSearchParamsSnapshot";

type VerifyResponse = {
  token?: string;
  message?: string;
  user?: { role?: string | null };
};

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useClientSearchParamsSnapshot();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await apiRequest<VerifyResponse>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: email || emailFromUrl, code }),
    });
    if (res.error) {
      setMessage(res.error);
      return;
    }
    if (res.data?.token) {
      const role = roleFromLoginResponse(res.data.user);
      saveAuthSession(res.data.token, role);
      router.push(homePathForRole(role));
      return;
    }
    setMessage(res.data?.message ?? "Vérification terminée.");
  }

  return (
    <div className="mx-auto max-w-md rounded-eig-lg border border-slate-200 bg-white p-6 shadow-eig">
      <h1 className="text-xl font-bold text-eig-blue">Vérification du compte</h1>
      {isDemoMode ? (
        <p className="mt-2 text-xs text-amber-800">Mode démo : entrez n&apos;importe quel code à 6 chiffres.</p>
      ) : null}
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          type="email"
          value={email || emailFromUrl}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="Code 6 chiffres"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button className="w-full rounded-xl bg-eig-blue px-4 py-2.5 text-sm font-semibold text-white" type="submit">
          Vérifier
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
