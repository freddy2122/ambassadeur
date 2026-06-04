"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, Trophy, Users, Wallet } from "lucide-react";
import { ChallengeCard } from "@/components/dashboard/ChallengeCard";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { LevelCard } from "@/components/dashboard/LevelCard";
import { ReferralCodeBlock } from "@/components/dashboard/ReferralCodeBlock";
import { ambassadorDisplayName, formatRank, type DashboardResponse } from "@/lib/ambassador";
import { apiRequest } from "@/lib/api";
import { formatFcfa } from "@/lib/platformStats";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardResponse>("/me/dashboard", {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setData(res.data ?? null);
      }
      setLoading(false);
    });
  }, []);

  const firstName = ambassadorDisplayName(data?.profile);
  const prospects = data?.kpis?.prospects ?? data?.kpis?.leads ?? 0;
  const validated = data?.kpis?.validated_enrollments ?? 0;
  const available = data?.earnings?.available ?? data?.kpis?.available_earnings ?? 0;
  const rank = data?.kpis?.rank ?? 0;
  const referralCode = data?.referral?.code ?? "";
  const personalUrl = data?.referral?.personal_url ?? "";
  const displayUrl = data?.referral?.display_url ?? personalUrl;

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="rounded-eig-lg border border-eig-blue bg-gradient-to-r from-eig-blue to-eig-blue-light p-6 text-white shadow-eig-lg">
        <p className="text-sm text-blue-100">Bonjour {firstName},</p>
        <h2 className="mt-1 text-2xl font-extrabold">Tableau de bord</h2>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
      ) : null}

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Chargement…
        </section>
      ) : null}

      {!loading && data ? (
        <>
          {referralCode && personalUrl ? (
            <ReferralCodeBlock code={referralCode} personalUrl={personalUrl} displayUrl={displayUrl} />
          ) : null}

          <section>
            <h3 className="mb-3 text-base font-bold text-eig-blue">Mes Résultats</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardKpiCard icon={Users} label="Prospects" value={String(prospects)} />
              <DashboardKpiCard icon={GraduationCap} label="Inscriptions validées" value={String(validated)} />
              <DashboardKpiCard icon={Wallet} label="Gains disponibles" value={formatFcfa(available)} />
              <DashboardKpiCard icon={Trophy} label="Mon rang" value={formatRank(rank)} />
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {data.challenge ? <ChallengeCard challenge={data.challenge} /> : null}
            {data.tier ? <LevelCard tier={data.tier} /> : null}
          </div>

          <section className="rounded-eig-lg border border-slate-200 bg-white p-5 shadow-eig">
            <h3 className="text-base font-bold text-eig-blue">Actions rapides</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <QuickLink href="/dashboard/classement" label="Voir le classement" />
              <QuickLink href="/dashboard/commissions" label="Mes gains" />
              <QuickLink href="/dashboard/leads" label="Mes prospects" />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-eig-blue transition-colors hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
