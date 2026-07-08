import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { AuthService } from "@/app/server/features/auth/auth.service";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { formatMoney } from "@/lib/utils";

async function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const result = await runtime.runPromise(
    Effect.gen(function* () {
      const auth = yield* AuthService;
      const checkout = yield* CheckoutService;
      const session = yield* auth.requireSession();
      const order = yield* checkout.getOrder(id);
      return { session, order };
    }).pipe(
      Effect.catchTag("Unauthorized", () => Effect.succeed(null)),
      Effect.catchTag("OrderNotFound", () =>
        Effect.succeed("not-found" as const),
      ),
    ),
  );

  if (result === null) {
    redirect(`/sign-in?next=/account/orders/${id}`);
  }
  if (result === "not-found") {
    notFound();
  }

  const { session, order } = result;
  // Guest orders (userId null) are not visible in the account area.
  if (!order.userId || order.userId !== session.user.id) {
    notFound();
  }

  return (
    <>
      <Link href="/account/orders" className="text-sm text-accent underline">
        ← Back to orders
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Order details
      </h1>
      <p className="mt-2 font-mono text-sm text-muted">{order.id}</p>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="capitalize text-muted">{order.status}</span>
          <span className="font-semibold">{formatMoney(order.totalCents)}</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-t border-border pt-3"
            >
              <span>
                {item.productName} · {item.variantName} × {item.quantity}
              </span>
              <span>{formatMoney(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-3xl bg-border/50" />
        }
      >
        <OrderDetailContent params={params} />
      </Suspense>
    </div>
  );
}
