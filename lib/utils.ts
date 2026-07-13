import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Resolve a site-relative path to an absolute URL (Stripe, emails, etc.). */
export function toAbsoluteUrl(
  pathOrUrl: string,
  base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  return new URL(pathOrUrl, base).href;
}
