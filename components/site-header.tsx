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

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=footwear", label: "Footwear" },
  { href: "/products?category=apparel", label: "Apparel" },
  { href: "/products?category=accessories", label: "Accessories" },
  { href: "/products?sale=1", label: "Sale" },
];

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-40">
      <div className="bg-pine text-pine-foreground">
        <Link
          href="/products?sale=1"
          prefetch
          className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 text-[11px] font-medium uppercase tracking-[0.22em] sm:px-6"
        >
          Night drop live · Free shipping over $75 · Sale kit up to 20% off
        </Link>
      </div>
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-xl tracking-tight">
              <span className="text-accent">Will</span>Commerce
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className="hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={<AccountLinkFallback />}>
              <AccountLink />
            </Suspense>
            <CartBadgeButton />
          </div>
        </div>
        <nav
          aria-label="Mobile shop"
          className="flex gap-4 overflow-x-auto border-t border-border/70 px-4 py-2 text-sm text-muted md:hidden"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} prefetch className="shrink-0 hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-pine text-pine-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-tight">
            Will<span className="text-accent">Commerce</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-pine-foreground/70">
            A dusk-hour running house. Kit cut for the miles after the office
            lights go out — and the ones before they come back on.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-pine-foreground/50">
            Shop
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/products" prefetch className="hover:text-accent">
                All kit
              </Link>
            </li>
            <li>
              <Link href="/products?category=footwear" prefetch className="hover:text-accent">
                Footwear
              </Link>
            </li>
            <li>
              <Link href="/products?sale=1" prefetch className="hover:text-accent">
                Sale
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-pine-foreground/50">
            Account
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/account/orders" className="hover:text-accent">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-accent">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className="hover:text-accent">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
