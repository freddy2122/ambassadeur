import { isDemoMode } from "@/lib/demo/config";
import { mockApiRequest } from "@/lib/demo/mockApi";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.partnext.org/api/v1";

export type ApiResult<T> = {
  data?: T;
  error?: string;
};

export { isDemoMode };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth_token", token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("auth_role");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<ApiResult<T>> {
  if (isDemoMode) {
    return mockApiRequest<T>(path, options);
  }

  try {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    if (auth) {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({})) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    if (!res.ok) {
      let msg =
        typeof json?.message === "string" ? json.message : "Requete API echouee.";
      if (json.errors && typeof json.errors === "object") {
        const firstKey = Object.keys(json.errors)[0];
        const firstVal = firstKey ? json.errors[firstKey]?.[0] : undefined;
        if (typeof firstVal === "string" && firstVal.length > 0) {
          msg = firstVal;
        }
      }
      return { error: msg };
    }
    return { data: json as T };
  } catch {
      return { error: "Impossible de joindre le serveur. Vérifiez que l'API est démarrée." };
  }
}
