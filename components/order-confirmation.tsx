"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { formatMoney, cn } from "@/lib/utils";

export type ConfirmationOrderItem = {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPriceCents: number;
  imageUrl: string;
  slug: string | null;
};

export type ConfirmationOrder = {
  id: string;
  email: string;
  status: string;
  paymentProvider: string;
  totalCents: number;
  items: ConfirmationOrderItem[];
};

function ItemCarousel({ items }: { items: ConfirmationOrderItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const multi = items.length > 1;

  const syncActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(Math.max(next, 0), items.length - 1));
  }, [items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActive();
    el.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    return () => {
      el.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, [syncActive]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(index, 0), items.length - 1);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
        aria-label="Ordered items"
      >
        {items.map((item, index) => {
          const href = item.slug ? `/products/${item.slug}` : null;
          const body = (
            <>
              <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft/35">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, 560px"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-start justify-between gap-3 p-5 text-left">
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight group-hover:text-accent">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {item.variantName} · Qty {item.quantity}
                  </p>
                </div>
                {href ? (
                  <div className="flex shrink-0 items-center gap-1 pt-1 text-sm font-medium text-muted transition group-hover:text-accent">
                    <span className="sr-only">View product</span>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </div>
                ) : null}
              </div>
            </>
          );

          return (
            <article
              key={item.id}
              className="w-full shrink-0 snap-center snap-always px-1"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
            >
              {href ? (
                <Link
                  href={href}
                  prefetch
                  className="group block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_18px_50px_-34px_rgba(20,17,15,0.45)] outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {body}
                </Link>
              ) : (
                <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_18px_50px_-34px_rgba(20,17,15,0.45)]">
                  {body}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {multi ? (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-[34%] flex -translate-y-1/2 items-center justify-between px-2">
            <button
              type="button"
              aria-label="Previous item"
              disabled={active === 0}
              onClick={() => scrollTo(active - 1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-card disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next item"
              disabled={active === items.length - 1}
              onClick={() => scrollTo(active + 1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-card disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to item ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active
                    ? "w-6 bg-accent"
                    : "w-2 bg-border hover:bg-muted",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function OrderConfirmation({ order }: { order: ConfirmationOrder }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="animate-order-confirm space-y-8">
      <header className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_30px_-12px_rgba(15,118,110,0.7)] animate-order-check">
          <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
        </div>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Order confirmed
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Thanks for your purchase
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          A receipt is on its way to{" "}
          <span className="font-medium text-foreground">{order.email}</span>.
          Your order is{" "}
          <span className="font-medium capitalize text-accent">
            {order.status}
          </span>
          .
        </p>
        <p className="mt-2 font-mono text-xs text-muted">
          {order.id}
          <span className="mx-2 text-border">·</span>
          {order.paymentProvider}
        </p>
      </header>

      <section aria-labelledby="ordered-items-heading">
        <div className="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <h2
              id="ordered-items-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Your items
            </h2>
            <p className="text-sm text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
              {order.items.length > 1 ? " · swipe to browse" : null}
            </p>
          </div>
        </div>
        <ItemCarousel items={order.items} />
      </section>

      <section
        aria-labelledby="order-summary-heading"
        className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_18px_50px_-34px_rgba(20,17,15,0.35)] sm:p-6"
      >
        <h2
          id="order-summary-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Order summary
        </h2>
        <ul className="mt-5 space-y-4">
          {order.items.map((item) => {
            const href = item.slug ? `/products/${item.slug}` : null;
            const title = (
              <span className="font-medium leading-snug">
                {item.productName}
              </span>
            );
            return (
              <li key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-accent-soft/40">
                  {href ? (
                    <Link href={href} prefetch className="absolute inset-0">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    {href ? (
                      <Link
                        href={href}
                        prefetch
                        className="hover:text-accent"
                      >
                        {title}
                      </Link>
                    ) : (
                      title
                    )}
                    <p className="mt-0.5 text-sm text-muted">
                      {item.variantName} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">
                    {formatMoney(item.unitPriceCents * item.quantity)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-semibold tracking-tight">
            {formatMoney(order.totalCents)}
          </span>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3 pb-2">
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:brightness-110"
        >
          Continue shopping
        </Link>
        <Link
          href="/account/orders"
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-medium transition hover:bg-accent-soft/40"
        >
          View orders
        </Link>
      </div>
    </div>
  );
}
