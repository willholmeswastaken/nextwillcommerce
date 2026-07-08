import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { safeRedirectPath } from "@/lib/safe-redirect";

/**
 * Optimistic auth gate for /account/* — cookie existence only.
 * Authoritative session validation happens in Server Components / Effect services.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/sign-in", request.url);
    const next = safeRedirectPath(request.nextUrl.pathname, "/account/orders");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
