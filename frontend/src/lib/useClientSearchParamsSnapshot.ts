"use client";

import { useMemo, useLayoutEffect, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Sync avec les navigations App Router et le bouton retour (subscribe vide = paramètres obsolètes). */
export function useClientSearchParamsSnapshot(): URLSearchParams {
  const pathname = usePathname();
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : "",
  );

  useLayoutEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}
