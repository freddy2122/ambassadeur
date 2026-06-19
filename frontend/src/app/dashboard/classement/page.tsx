"use client";

import { useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { type LeaderboardEntry, type LeaderboardResponse } from "@/lib/ambassador";
import { apiRequest } from "@/lib/api";
import { LoadingBlock } from "@/components/ui/LoadingState";
import { cn } from "@/lib/cn";

export default function ClassementPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<LeaderboardResponse>("/me/leaderboard?limit=20", {}, true).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setData(res.data ?? null);
      }
      setLoading(false);
    });
  }, []);

  const leaderboard = data?.leaderboard ?? [];
  const me = data?.me;

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="rounded-eig-lg border border-eig-blue bg-eig-blue p-6 text-white shadow-eig">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-eig-yellow-light text-eig-blue">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-eig-yellow">Classement Général</p>
            <h2 className="text-2xl font-extrabold">Top Ambassadeurs EIG</h2>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</section>
      ) : null}

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <LoadingBlock label="Chargement du classement…" />
        </section>
      ) : null}

      {!loading ? (
        <>
          <section className="overflow-hidden rounded-eig-lg border border-slate-200 bg-white shadow-eig">
            <ul className="divide-y divide-slate-100">
              {leaderboard.length === 0 ? (
                <li className="p-6 text-sm text-slate-600">Aucun ambassadeur classé pour le moment.</li>
              ) : (
                leaderboard.map((entry) => (
                  <LeaderboardRow key={entry.id} entry={entry} isMe={entry.id === me?.id} />
                ))
              )}
            </ul>
          </section>

          {me ? (
            <section className="rounded-eig-lg border border-eig-cyan/30 bg-eig-cyan/5 p-5">
              <p className="text-sm font-semibold text-eig-blue">Votre position</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-eig-blue text-sm font-bold text-white">
                    {me.first_name?.[0]?.toUpperCase() ?? "A"}
                  </div>
                  <div>
                    <p className="font-bold text-eig-blue">{me.first_name ?? me.name}</p>
                    <p className="text-sm text-slate-600">{me.validated_enrollments ?? 0} inscriptions</p>
                  </div>
                </div>
                <p className="text-lg font-extrabold text-eig-blue">Rang #{me.rank}</p>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const RankIcon = entry.rank === 1 ? Crown : entry.rank === 2 || entry.rank === 3 ? Medal : null;
  const rankColors =
    entry.rank === 1
      ? "text-amber-500"
      : entry.rank === 2
        ? "text-slate-400"
        : entry.rank === 3
          ? "text-amber-700"
          : "text-eig-muted";

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4",
        isMe && "bg-eig-cyan/5",
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("flex w-10 items-center justify-center text-lg font-extrabold", rankColors)}>
          {RankIcon ? <RankIcon size={22} /> : `${entry.rank}.`}
        </div>
        <div>
          <p className="font-semibold text-eig-blue">{entry.name}</p>
          <p className="text-sm text-slate-600">{entry.validated_enrollments} inscriptions</p>
        </div>
      </div>
      {entry.rank <= 3 ? (
        <span className={cn("text-xs font-bold uppercase tracking-wide", rankColors)}>
          {entry.rank === 1 ? "Or" : entry.rank === 2 ? "Argent" : "Bronze"}
        </span>
      ) : null}
    </li>
  );
}
