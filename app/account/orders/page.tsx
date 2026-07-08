import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { AuthService } from "@/app/server/features/auth/auth.service";
import { formatMoney } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

async function OrdersContent() {
  await connection();
  const result = await runtime.runPromise(
    Effect.gen(function* () {
      const auth = yield* AuthService;
      const checkout = yield* CheckoutService;
      const session = yield* auth.requireSession();
      const orders = yield* checkout.listMyOrders();
      return { session, orders };
    }).pipe(Effect.catchTag("Unauthorized", () => Effect.succeed(null))),
  );

  if (!result) {
    redirect("/sign-in?next=/account/orders");
  }

  const { session, orders } = result;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
          <p className="mt-2 text-sm text-muted">
            Signed in as {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-muted">
            When you complete a checkout while signed in, it will show up here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-3xl border border-border bg-card p-5 transition hover:border-accent"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-muted">{order.id}</p>
                  <p className="mt-1 font-medium capitalize">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatMoney(order.totalCents)}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-3xl bg-border/50" />
        }
      >
        <OrdersContent />
      </Suspense>
    </div>
  );
}
