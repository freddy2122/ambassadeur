/** Origine du site tel qu’affiché dans le navigateur (Partnext, Vercel, local…). */
export function getClientOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

/** Hostname affiché (ex. ambassadeur.partnext.org, ambassadeur-lilac.vercel.app). */
export function getClientHost(): string {
  if (typeof window === "undefined") return "";
  return window.location.host;
}

/** Corrige une URL mal formée (ex. `192.168.1.1http://…`). */
export function sanitizeReferralUrl(url: string | null | undefined): string {
  const raw = (url ?? "").trim();
  if (!raw) return "";

  const httpMatch = raw.match(/https?:\/\/[^\s]+/i);
  if (httpMatch) {
    return httpMatch[0].replace(/\/+$/, "");
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  if (!/^https?:\/\//i.test(raw)) {
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  return raw.replace(/\/+$/, "");
}

/**
 * Lien de parrainage basé sur le domaine courant (window.location.origin).
 * Chaque déploiement (Partnext, Vercel, localhost) produit son propre lien.
 */
export function buildPersonalReferralUrl(
  code: string,
  apiUrl?: string | null,
  originOverride?: string,
): string {
  const trimmed = code.trim();
  if (!trimmed) return "";

  const path = `/formations?ref=${encodeURIComponent(trimmed)}`;
  const origin = (originOverride ?? getClientOrigin()).trim();

  if (origin) {
    return `${origin}${path}`;
  }

  const fallback = sanitizeReferralUrl(apiUrl);
  if (fallback.startsWith("http")) {
    try {
      const parsed = new URL(fallback);
      parsed.pathname = "/formations";
      parsed.search = `?ref=${encodeURIComponent(trimmed)}`;
      return parsed.toString();
    } catch {
      /* ignore */
    }
  }

  return path;
}
