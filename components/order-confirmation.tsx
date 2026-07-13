import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { resolveProductImageSrc } from "@/lib/product-image";

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

export function OrderConfirmation({ order }: { order: ConfirmationOrder }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="animate-order-confirm space-y-8">
      <header className="text-center">
        <div className="mx-auto flex h-14 w-14 animate-order-check items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_30px_-12px_rgba(15,118,110,0.7)]">
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

      <section
        aria-labelledby="order-summary-heading"
        className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_18px_50px_-34px_rgba(20,17,15,0.35)] sm:p-6"
      >
        <div className="flex items-end justify-between gap-3">
          <h2
            id="order-summary-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Your items
          </h2>
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <ul className="mt-5 space-y-4">
          {order.items.map((item) => {
            const href = item.slug ? `/products/${item.slug}` : null;
            const title = (
              <span className="font-medium leading-snug">
                {item.productName}
              </span>
            );
            return (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-accent-soft/40 sm:h-24 sm:w-24">
                  {href ? (
                    <Link href={href} prefetch className="absolute inset-0">
                      <Image
                        src={resolveProductImageSrc(item.imageUrl)}
                        alt={item.productName}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </Link>
                  ) : (
                    <Image
                      src={resolveProductImageSrc(item.imageUrl)}
                      alt={item.productName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3 py-0.5">
                  <div className="min-w-0">
                    {href ? (
                      <Link href={href} prefetch className="hover:text-accent">
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
