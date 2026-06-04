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
