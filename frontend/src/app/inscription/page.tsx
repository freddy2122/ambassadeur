"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { fetchPaymentGatewayConfig } from "@/lib/paymentGateway";
import { SubmitButton } from "@/components/ui/LoadingState";
import { formations, getFormationBySlug } from "@/lib/formations";

const STEPS = [
  { num: 1, label: "Parcours" },
  { num: 2, label: "Coordonnées" },
  { num: 3, label: "Finalisation" },
] as const;

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0b2e7a]/15 transition placeholder:text-slate-400 focus:border-[#0b2e7a] focus:ring-2";
const selectCls = inputCls;

/** Brouillon formulaire (pas de fichiers : le navigateur ne les garde pas après rechargement). */
const INSCRIPTION_DRAFT_KEY = "eig_inscription_draft_v1";

type DraftFormFields = {
  code: string;
  full_name: string;
  email: string;
  phone: string;
  program_type: "superieur" | "centre" | "college";
  formation_slug: string;
  last_diploma: string;
  address: string;
  guardian_name: string;
  identity_number: string;
};

function normalizeProgramType(v: unknown): DraftFormFields["program_type"] {
  if (v === "centre" || v === "college" || v === "superieur") return v;
  return "superieur";
}

function clearInscriptionDraft(): void {
  try {
    localStorage.removeItem(INSCRIPTION_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCode = searchParams.get("code") ?? "";
  const initialFormationSlug = searchParams.get("formation") ?? "";
  const initialFormation = getFormationBySlug(initialFormationSlug);

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [form, setForm] = useState({
    code: initialCode,
    full_name: "",
    email: "",
    phone: "",
    program_type: "superieur" as "superieur" | "centre" | "college",
    formation_slug: initialFormation?.slug ?? "",
    last_diploma: "",
    address: "",
    guardian_name: "",
    identity_number: "",
  });
  const [msg, setMsg] = useState("");
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentGatewayLabel, setPaymentGatewayLabel] = useState("Genius Pay");
  const [draftBanner, setDraftBanner] = useState<string | null>(null);
  /** Après première lecture localStorage ; évite d’écraser le brouillon avec l’état initial vide. */
  const [draftSaveReady, setDraftSaveReady] = useState(false);

  useEffect(() => {
    fetchPaymentGatewayConfig().then((config) => {
      setPaymentGatewayLabel(config.label);
    });
  }, []);

  useEffect(() => {
    const ref = searchParams.get("ref");
    const formation = searchParams.get("formation");
    const code = searchParams.get("code");
    if (ref && !formation && !code) {
      router.replace(`/formations?ref=${encodeURIComponent(ref)}`);
    }
  }, [searchParams, router]);

  /** Restaure le brouillon une fois au chargement (priorité au code / formation dans l’URL). */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(INSCRIPTION_DRAFT_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { v?: number; step?: unknown; form?: Partial<DraftFormFields> };
      if (parsed?.v !== 1 || !parsed.form || typeof parsed.form !== "object") {
        return;
      }

      const f = parsed.form;
      setForm((prev) => ({
        ...prev,
        code: initialCode || (typeof f.code === "string" ? f.code : prev.code),
        formation_slug:
          initialFormationSlug || (typeof f.formation_slug === "string" ? f.formation_slug : prev.formation_slug),
        full_name: typeof f.full_name === "string" ? f.full_name : prev.full_name,
        email: typeof f.email === "string" ? f.email : prev.email,
        phone: typeof f.phone === "string" ? f.phone : prev.phone,
        program_type: normalizeProgramType(f.program_type),
        last_diploma: typeof f.last_diploma === "string" ? f.last_diploma : prev.last_diploma,
        address: typeof f.address === "string" ? f.address : prev.address,
        guardian_name: typeof f.guardian_name === "string" ? f.guardian_name : prev.guardian_name,
        identity_number: typeof f.identity_number === "string" ? f.identity_number : prev.identity_number,
      }));

      const s = typeof parsed.step === "number" ? parsed.step : 1;
      const stepClamped = Math.min(3, Math.max(1, s));
      setStep(stepClamped);
      setDraftBanner(`Reprise de votre dossier à l’étape « ${STEPS.find((x) => x.num === stepClamped)?.label ?? stepClamped} ».`);
    } catch {
      /* brouillon illisible */
    } finally {
      setDraftSaveReady(true);
    }
    // intentional : restauration unique au montage avec l’URL initiale
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Sauvegarde automatique tant que la candidature n’est pas envoyée. */
  useEffect(() => {
    if (!draftSaveReady) return;
    try {
      const payload: { v: 1; step: number; form: DraftFormFields } = {
        v: 1,
        step,
        form: {
          code: form.code,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          program_type: form.program_type,
          formation_slug: form.formation_slug,
          last_diploma: form.last_diploma,
          address: form.address,
          guardian_name: form.guardian_name,
          identity_number: form.identity_number,
        },
      };
      localStorage.setItem(INSCRIPTION_DRAFT_KEY, JSON.stringify(payload));
    } catch {
      /* quota ou mode privé */
    }
  }, [draftSaveReady, step, form]);

  const codeEffective = (form.code || initialCode).trim();
  const formationEffective = form.formation_slug || initialFormationSlug;

  function validateStep(s: number): boolean {
    setStepError("");
    if (s === 1) {
      if (!formationEffective) {
        setStepError("Sélectionnez une formation.");
        return false;
      }
    }
    if (s === 2) {
      if (!form.full_name.trim()) {
        setStepError("Le nom complet est obligatoire.");
        return false;
      }
      if (!form.email.trim() || !form.email.includes("@")) {
        setStepError("Une adresse e-mail valide est obligatoire.");
        return false;
      }
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 8) {
        setStepError("Un numéro de téléphone joignable est obligatoire (paiement en ligne).");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(3, prev + 1));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStepError("");
    setMsg("");
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    if (!codeEffective) {
      setStepError(
        "Le code de parrainage est absent. Utilisez le lien d’invitation envoyé par votre ambassadeur (il contient le code automatiquement).",
      );
      return;
    }
    if (!identityFile || !diplomaFile) {
      setStepError(
        "Veuillez joindre la copie de votre pièce d’identité (ou CIP) et la copie de votre attestation ou dernier diplôme (PDF, JPG ou PNG, max 12 Mo chacune).",
      );
      return;
    }
    const slug = String(formationEffective || "").trim();
    if (!slug) {
      setStepError("Formation manquante : revenez à l’étape 1.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("code", codeEffective.toUpperCase());
    fd.append("full_name", form.full_name.trim());
    fd.append("email", form.email.trim());
    fd.append("phone", form.phone.trim());
    fd.append("program_type", form.program_type);
    fd.append("formation_slug", slug);
    if (form.last_diploma.trim()) fd.append("last_diploma", form.last_diploma.trim());
    if (form.address.trim()) fd.append("address", form.address.trim());
    if (form.guardian_name.trim()) fd.append("guardian_name", form.guardian_name.trim());
    if (form.identity_number.trim()) fd.append("identity_number", form.identity_number.trim());
    fd.append("identity_document", identityFile);
    fd.append("diploma_document", diplomaFile);

    const res = await apiRequest<{ message?: string; lead?: { id: number; formation_slug?: string | null } }>(
      "/prospects",
      {
        method: "POST",
        body: fd,
      },
    );

    if (res.error) {
      setSubmitting(false);
      setMsg(res.error);
      return;
    }

    const leadId = res.data?.lead?.id;
    if (!leadId) {
      setSubmitting(false);
      setMsg("Réponse inscription incomplète — contactez le support.");
      return;
    }

    const pay = await apiRequest<{ checkout_url?: string; authorization_url?: string; message?: string }>(
      "/payments/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          lead_id: leadId,
          formation_slug: slug,
          frontend_origin: typeof window !== "undefined" ? window.location.origin : undefined,
        }),
      },
    );

    if (pay.error || !pay.data) {
      setSubmitting(false);
      setMsg(
        pay.error ??
          "Votre dossier est enregistré mais le paiement n’a pas pu démarrer. Conservez cette page et réessayez via le lien communiqué par l’école.",
      );
      return;
    }

    const checkoutUrl = pay.data.checkout_url ?? pay.data.authorization_url;
    if (!checkoutUrl) {
      setSubmitting(false);
      setMsg("Lien de paiement indisponible. Réessayez plus tard ou contactez l’école.");
      return;
    }

    clearInscriptionDraft();
    window.location.assign(checkoutUrl);
  }

  function resetDraft() {
    clearInscriptionDraft();
    setDraftBanner(null);
    setStep(1);
    setIdentityFile(null);
    setDiplomaFile(null);
    setStepError("");
    setMsg("");
    setForm({
      code: initialCode,
      full_name: "",
      email: "",
      phone: "",
      program_type: "superieur",
      formation_slug: initialFormation?.slug ?? "",
      last_diploma: "",
      address: "",
      guardian_name: "",
      identity_number: "",
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#e8eef9] via-white to-[#dff6fc] px-4 py-10 md:py-14">
      <div className="mx-auto mb-8 flex w-full max-w-lg flex-shrink-0 flex-col items-center text-center">
        <Link href="/formations" className="inline-block rounded-lg px-2 py-1 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#0b2e7a]">
          <Image src="/eig-logo.svg" alt="EIG Groupe" width={140} height={56} priority className="h-12 w-auto md:h-14" />
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-[#14aee5]">Candidature</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0b2e7a] md:text-3xl">
          Inscription étudiant
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Envoyez vos pièces, validez le dossier, puis réglez vos frais d’inscription en ligne via {paymentGatewayLabel}{" "}
          (Mobile Money, carte…).
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        {/* Step indicator */}
        <nav aria-label="Progression du formulaire" className="mb-8">
          <ol className="flex items-start justify-between gap-1">
            {STEPS.map((s, idx) => {
              const active = step === s.num;
              const done = step > s.num;
              return (
                <li key={s.num} className="relative flex flex-1 flex-col items-center">
                  {idx > 0 ? (
                    <div
                      className={`absolute -left-1/2 top-[1.125rem] z-0 h-0.5 w-full translate-x-[50%] ${
                        step > STEPS[idx - 1]?.num ? "bg-[#0b2e7a]" : "bg-slate-200"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      done
                        ? "bg-[#0b2e7a] text-white"
                        : active
                          ? "bg-[#14aee5] text-white ring-4 ring-[#14aee5]/25"
                          : "border-2 border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {done ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </span>
                  <span
                    className={`mt-2 text-center text-[11px] font-semibold leading-tight md:text-xs ${
                      active ? "text-[#0b2e7a]" : done ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-[#0b2e7a]/10 backdrop-blur-sm md:p-8">
          {draftBanner ? (
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <p>{draftBanner} Les fichiers joints doivent être sélectionnés à nouveau (étape 3).</p>
              <button
                type="button"
                onClick={resetDraft}
                className="shrink-0 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Tout effacer
              </button>
            </div>
          ) : null}
          {stepError ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{stepError}</p>
          ) : null}

          <form className="grid gap-4" onSubmit={onSubmit}>
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="formation" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Formation souhaitée
                  </label>
                  <select
                    id="formation"
                    className={selectCls}
                    value={form.formation_slug || initialFormationSlug}
                    onChange={(e) => setForm({ ...form, formation_slug: e.target.value })}
                  >
                    <option value="">Choisir dans la liste</option>
                    {formations.map((formation) => (
                      <option key={formation.slug} value={formation.slug}>
                        {formation.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="program" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Niveau / filière visée
                  </label>
                  <select
                    id="program"
                    className={selectCls}
                    value={form.program_type}
                    onChange={(e) =>
                      setForm({ ...form, program_type: e.target.value as "superieur" | "centre" | "college" })
                    }
                  >
                    <option value="superieur">Supérieur</option>
                    <option value="centre">Centre</option>
                    <option value="college">Collège</option>
                  </select>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nom et prénom(s)
                  </label>
                  <input
                    id="full_name"
                    className={inputCls}
                    placeholder="Selon votre pièce d’identité"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputCls}
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Téléphone <span className="text-red-600">*</span> (WhatsApp, Mobile Money)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className={inputCls}
                    placeholder="+229 ou 01…"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="diploma" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dernier diplôme obtenu
                  </label>
                  <input
                    id="diploma"
                    className={inputCls}
                    placeholder="Ex : BAC série D"
                    value={form.last_diploma}
                    onChange={(e) => setForm({ ...form, last_diploma: e.target.value })}
                  />
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="rounded-xl border border-[#c8ddf7] bg-gradient-to-br from-[#f0f7ff] to-[#f5f9ff] p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-[#0b2e7a]">Formation :</span>{" "}
                    {getFormationBySlug(formationEffective)?.title ?? "—"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="identity_document" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Copie de la carte nationale d&apos;identité ou CIP <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="identity_document"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
                    className={`${inputCls} cursor-pointer py-2 file:mr-4 file:rounded-md file:border-0 file:bg-[#0b2e7a]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#0b2e7a]`}
                    onChange={(ev) => setIdentityFile(ev.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-slate-500">PDF ou photo nette recto‑verso, max 12 Mo.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="diploma_document" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Copie d&apos;attestation ou dernier diplôme <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="diploma_document"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.pdf,application/pdf"
                    className={`${inputCls} cursor-pointer py-2 file:mr-4 file:rounded-md file:border-0 file:bg-[#0b2e7a]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#0b2e7a]`}
                    onChange={(ev) => setDiplomaFile(ev.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-slate-500">PDF ou JPG/PNG lisible — attestation ou relevé équivalent ou diplôme, max 12 Mo.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Adresse
                  </label>
                  <textarea
                    id="address"
                    className={`${inputCls} min-h-[88px] resize-y`}
                    placeholder="Ville, quartier…"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="guardian_name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Parent / tuteur (mineur ou optionnel)
                  </label>
                  <input
                    id="guardian_name"
                    className={inputCls}
                    value={form.guardian_name}
                    onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="identity_number" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pièce d’identité — numéro (optionnel)
                  </label>
                  <input
                    id="identity_number"
                    className={inputCls}
                    value={form.identity_number}
                    onChange={(e) => setForm({ ...form, identity_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="patron-code" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code de parrainage
                  </label>
                  <input
                    id="patron-code"
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                    className={`${inputCls} cursor-default border-slate-200 bg-slate-100 font-mono tracking-wide text-slate-800 focus:border-slate-200 focus:ring-0`}
                    value={codeEffective ? codeEffective.toUpperCase() : ""}
                    placeholder="Non fourni par le lien"
                  />
                  <p className="text-xs text-slate-500">
                    Renseigné automatiquement par votre lien ambassadeur — non modifiable.
                  </p>
                </div>
              </>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStepError("");
                  setStep((prev) => Math.max(1, prev - 1));
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={step === 1}
              >
                Retour
              </button>
              <div className="flex gap-2">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-lg bg-[#0b2e7a] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0b2e7a]/20 hover:bg-[#092563]"
                  >
                    Continuer
                  </button>
                ) : (
                  <SubmitButton
                    loading={submitting}
                    loadingLabel="Envoi puis paiement…"
                    className="rounded-lg bg-[#14aee5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#14aee5]/25 hover:bg-[#1199cc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Envoyer et payer les frais d&apos;inscription
                  </SubmitButton>
                )}
              </div>
            </div>
          </form>

          {msg ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            >
              {msg}
            </p>
          ) : null}
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-6 text-center text-xs text-slate-500">
          <Link href="/formations" className="font-medium text-[#0b2e7a] hover:underline">
            ← Retour au catalogue des formations
          </Link>
          <span className="hidden sm:inline text-slate-300" aria-hidden>
            |
          </span>
          <button
            type="button"
            onClick={resetDraft}
            className="font-medium text-slate-600 underline-offset-2 hover:text-[#0b2e7a] hover:underline"
          >
            Effacer mon brouillon et recommencer
          </button>
        </p>
      </div>
    </div>
  );
}

function InscriptionFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8eef9] via-white to-[#dff6fc] px-4">
      <div className="rounded-2xl border border-white/70 bg-white/90 px-10 py-12 text-center text-sm font-medium text-slate-600 shadow-lg">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#0b2e7a]/20 border-t-[#0b2e7a]" />
        Chargement du formulaire…
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<InscriptionFallback />}>
      <InscriptionForm />
    </Suspense>
  );
}
