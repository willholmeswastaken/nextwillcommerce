import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { UserRound } from "lucide-react";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { AuthService } from "@/app/server/features/auth/auth.service";
import { CartBadgeButton } from "@/components/cart-badge-button";

async function AccountLink() {
  await connection();
  const session = await runtime.runPromise(
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return yield* auth.getSession();
    }),
  );

  if (session?.user) {
    return (
      <Link
        href="/account/orders"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm transition hover:bg-accent-soft"
      >
        <UserRound className="h-4 w-4" />
        <span className="hidden sm:inline">{session.user.name.split(" ")[0]}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm transition hover:bg-accent-soft"
    >
      Sign in
    </Link>
  );
}

/** Stable chrome while auth resolves — no pulse flash. */
function AccountLinkFallback() {
  return (
    <Link
      href="/sign-in"
      className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm transition hover:bg-accent-soft"
    >
      Sign in
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold tracking-tight">
            <span className="text-accent">Will</span>Commerce
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            <Link href="/products" className="hover:text-foreground">
              Shop
            </Link>
            <Link
              href="/products?category=footwear"
              className="hover:text-foreground"
            >
              Footwear
            </Link>
            <Link
              href="/products?category=apparel"
              className="hover:text-foreground"
            >
              Apparel
            </Link>
            <Link
              href="/products?category=accessories"
              className="hover:text-foreground"
            >
              Accessories
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Suspense fallback={<AccountLinkFallback />}>
            <AccountLink />
          </Suspense>
          <CartBadgeButton />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          WillCommerce — a blazing-fast Next.js 16.3 + Effect-TS ecommerce
          template.
        </p>
        <p>Instant navigations · Cache Components · Better Auth</p>
      </div>
    </footer>
  );
}
