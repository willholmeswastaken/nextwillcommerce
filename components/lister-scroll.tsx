"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

export const LISTER_CONTROLS_ID = "lister-controls";

function stickyHeaderOffset() {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  return (header?.getBoundingClientRect().height ?? 96) + 8;
}

function controlsInView(el: HTMLElement, offset: number) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.62 && rect.bottom > offset + 40;
}

function revealListerControls() {
  const el = document.getElementById(LISTER_CONTROLS_ID);
  if (!el) return;
  const offset = stickyHeaderOffset();
  if (controlsInView(el, offset)) return;
  window.scrollTo({
    top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset),
    behavior: "instant",
  });
}

/** After a filter/sort change, keep the filter bar on screen if Next.js jumped. */
export function ListerScroll() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    revealListerControls();
    const frame = window.requestAnimationFrame(revealListerControls);
    const timer = window.setTimeout(revealListerControls, 50);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [query]);

  return null;
}
