import { Suspense } from "react";
import Link from "next/link";
import { Effect } from "effect";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { updateTag } from "next/cache";
import { runtime } from "@/app/server/runtime";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { formatMoney } from "@/lib/utils";

/**
 * Blocking strategy — confirmation must show authoritative paid state,
 * never a stale shell. Still wrap dynamic work in Suspense for Cache Components.
 */
export const instant = false;

async function ConfirmationContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ provider?: string; token?: string }>;
}) {
  await connection();
  const { id } = await params;
  const { provider, token } = await searchParams;

  const order = await runtime.runPromise(
    Effect.gen(function* () {
      const checkout = yield* CheckoutService;
      if (provider === "stripe") {
        // Stripe success URL uses the Checkout Session id; fulfillment is
        // idempotent and also runs from the webhook.
        return yield* checkout.fulfillStripeSession(id);
      }
      if (!token) {
        return yield* Effect.fail(new Error("missing token"));
      }
      return yield* checkout.getOrderForConfirmation(id, token);
    }).pipe(Effect.catchAll(() => Effect.succeed(null))),
  );

  if (!order) {
    notFound();
  }

  if (provider === "stripe") {
    updateTag("products");
  }

  return (
    <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-[0_18px_50px_-34px_rgba(20,17,15,0.45)]">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
        Order confirmed
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Thanks for your purchase
      </h1>
      <p className="mt-3 text-muted">
        Order <span className="font-mono text-foreground">{order.id}</span> is{" "}
        <span className="font-medium text-accent">{order.status}</span> via{" "}
        {order.paymentProvider}.
      </p>

      <ul className="mt-8 space-y-3 text-left text-sm">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
          >
            <span>
              {item.productName} · {item.variantName} × {item.quantity}
            </span>
            <span className="font-medium">
              {formatMoney(item.unitPriceCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted">Total</span>
        <span className="text-lg font-semibold">
          {formatMoney(order.totalCents)}
        </span>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Continue shopping
        </Link>
        <Link
          href="/account/orders"
          className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-medium"
        >
          View orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ provider?: string; token?: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-[2rem] bg-border/50" />
        }
      >
        <ConfirmationContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
