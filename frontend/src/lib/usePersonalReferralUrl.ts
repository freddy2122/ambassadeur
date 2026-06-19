"use client";

import { useEffect, useState } from "react";
import { buildPersonalReferralUrl, getClientHost } from "@/lib/referralUrl";

/**
 * Lien personnel recalculé côté client après hydratation
 * pour refléter le domaine réel (Partnext, Vercel, IP locale…).
 */
export function usePersonalReferralUrl(code: string, apiUrl?: string | null) {
  const [link, setLink] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    const currentHost = getClientHost();
    setHost(currentHost);
    setLink(buildPersonalReferralUrl(code, apiUrl));
  }, [code, apiUrl]);

  return { link, host, ready: Boolean(link && host) };
}
