import { Suspense } from "react";
import { Effect } from "effect";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { updateTag } from "next/cache";
import { runtime } from "@/app/server/runtime";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { OrderConfirmation } from "@/components/order-confirmation";

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
    <OrderConfirmation
      order={{
        id: order.id,
        email: order.email,
        status: order.status,
        paymentProvider: order.paymentProvider,
        totalCents: order.totalCents,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          imageUrl: item.variant.product.imageUrl,
          slug: item.variant.product.slug,
        })),
      }}
    />
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
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-border/60" />
            <div className="mx-auto h-8 w-64 animate-pulse rounded bg-border/50" />
            <div className="h-64 animate-pulse rounded-[1.75rem] bg-border/40" />
          </div>
        }
      >
        <ConfirmationContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
