"use server";

import { Effect } from "effect";
import { revalidatePath } from "next/cache";
import { AuthService } from "@/app/server/features/auth/auth.service";
import { CartService } from "@/app/server/features/cart/cart.service";
import { runAction } from "@/app/server/lib/action-builder";

export async function mergeCartOnLoginAction() {
  const result = await runAction(
    Effect.gen(function* () {
      const auth = yield* AuthService;
      const cart = yield* CartService;
      const session = yield* auth.requireSession();
      return yield* cart.mergeOnLogin(session.user.id);
    }),
  );
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}
