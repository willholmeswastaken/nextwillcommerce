import { Suspense } from "react";
import { connection } from "next/server";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { CartService } from "@/app/server/features/cart/cart.service";
import { CartView } from "@/components/cart-view";
import { CartSkeleton } from "@/components/skeletons";

async function CartContent() {
  await connection();
  const cart = await runtime.runPromise(
    Effect.gen(function* () {
      const cartService = yield* CartService;
      return yield* cartService.getOrCreateCart();
    }),
  );

  return <CartView cart={cart} />;
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-2 text-sm text-muted">
          Prefer the cart drawer from the header — this page remains as a
          fallback.
        </p>
      </div>
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  );
}
