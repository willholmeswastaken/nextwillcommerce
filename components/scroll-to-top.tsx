"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Instant Navigations / Cache Components can preserve window scroll across
 * soft pushes (e.g. scrolled lister → PDP). Reset on pathname change for
 * forward navigations; skip popstate so back/forward restore works.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isPopState = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isPopState.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
