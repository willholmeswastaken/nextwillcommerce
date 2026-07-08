import { connection } from "next/server";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { CartService } from "@/app/server/features/cart/cart.service";
import { CartProvider } from "@/components/cart-provider";

export async function CartShell({ children }: { children: React.ReactNode }) {
  await connection();
  const cart = await runtime.runPromise(
    Effect.gen(function* () {
      const cartService = yield* CartService;
      return yield* cartService.getCart();
    }),
  );

  return (
    <CartProvider initialCount={cart?.itemCount ?? 0}>{children}</CartProvider>
  );
}
