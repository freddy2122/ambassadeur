import { clearToken, setToken } from "@/lib/api";

const ROLE_STORAGE_KEY = "auth_role";
const FLASH_STORAGE_KEY = "auth_flash";

export type AppRole = "admin" | "ambassador" | string;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export function homePathForRole(role: string | null | undefined): string {
  return isAdminRole(role) ? "/admin" : "/dashboard";
}

export function getAuthRole(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ROLE_STORAGE_KEY);
}

export function saveAuthSession(token: string, role: string): void {
  setToken(token);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function clearAuthSession(): void {
  clearToken();
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
  window.localStorage.removeItem(FLASH_STORAGE_KEY);
}

export function setAuthFlash(message: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FLASH_STORAGE_KEY, message);
}

export function consumeAuthFlash(): string | null {
  if (typeof window === "undefined") return null;
  const message = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
  window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
  return message;
}

export function roleFromLoginResponse(user?: { role?: string | null }): string {
  return user?.role === "admin" ? "admin" : "ambassador";
}

/** Corps JSON login : champ `login` (nouvelle API) + `email` si adresse (ancienne API prod). */
export function buildLoginRequestBody(login: string, password: string): string {
  const value = login.trim();
  const payload: Record<string, string> = { login: value, password };
  if (value.includes("@")) {
    payload.email = value.toLowerCase();
  }
  return JSON.stringify(payload);
}

export function resolveProfileRole(profileRole?: string | null, fallback?: string | null): string {
  if (profileRole === "admin" || profileRole === "ambassador") return profileRole;
  if (fallback === "admin" || fallback === "ambassador") return fallback;
  return "ambassador";
}
