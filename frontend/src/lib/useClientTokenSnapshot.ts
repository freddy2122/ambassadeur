"use client";

import { useSyncExternalStore } from "react";
import { getToken } from "@/lib/api";
import { useHydrated } from "@/lib/useHydrated";

export function useClientTokenSnapshot() {
  const isHydrated = useHydrated();

  const token = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("focus", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("focus", onStoreChange);
      };
    },
    () => getToken(),
    () => null,
  );

  return {
    isHydrated,
    token,
    hasToken: Boolean(token),
  };
}
