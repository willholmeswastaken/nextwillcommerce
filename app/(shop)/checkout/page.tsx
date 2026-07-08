import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { CartService } from "@/app/server/features/cart/cart.service";
import { AuthService } from "@/app/server/features/auth/auth.service";
import { CheckoutForm } from "@/components/checkout-form";
import { formatMoney } from "@/lib/utils";

async function CheckoutContent() {
  await connection();
  const { cart, session } = await runtime.runPromise(
    Effect.gen(function* () {
      const cartService = yield* CartService;
      const auth = yield* AuthService;
      const [cart, session] = yield* Effect.all(
        [cartService.getCart(), auth.getSession()],
        { concurrency: "unbounded" },
      );
      return { cart, session };
    }),
  );

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-xl font-semibold">Nothing to checkout</h2>
        <p className="mt-2 text-muted">Add items to your cart first.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const usingStripe = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Items</h2>
        <ul className="mt-4 space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span>
                {item.variant.product.name} · {item.variant.name} ×{" "}
                {item.quantity}
              </span>
              <span className="font-medium">
                {formatMoney(item.variant.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment</h2>
        <CheckoutForm
          subtotalCents={cart.subtotalCents}
          defaultEmail={session?.user?.email}
          usingStripe={usingStripe}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Stream strategy — payment form streams after cart resolution.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-3xl bg-border/50" />
        }
      >
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
