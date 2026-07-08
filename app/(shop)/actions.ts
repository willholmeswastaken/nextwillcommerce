"use server";

import { Effect } from "effect";
import { revalidatePath, updateTag } from "next/cache";
import { CartService } from "@/app/server/features/cart/cart.service";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { decodeInput, runAction } from "@/app/server/lib/action-builder";
import {
  AddToCartSchema,
  CheckoutSchema,
  RemoveCartItemSchema,
  UpdateCartItemSchema,
} from "@/app/server/lib/errors";
import { redirect } from "next/navigation";

/** Refresh the layout so CartBadge (and other request-scoped UI) re-renders. */
function revalidateCartUi() {
  revalidatePath("/", "layout");
}

export async function addToCartAction(input: unknown) {
  const result = await runAction(
    Effect.gen(function* () {
      const data = yield* decodeInput(AddToCartSchema, input);
      const cart = yield* CartService;
      return yield* cart.addItem(data);
    }),
  );
  if (result.success) {
    revalidateCartUi();
  }
  return result;
}

export async function updateCartItemAction(input: unknown) {
  const result = await runAction(
    Effect.gen(function* () {
      const data = yield* decodeInput(UpdateCartItemSchema, input);
      const cart = yield* CartService;
      return yield* cart.updateItem(data);
    }),
  );
  if (result.success) {
    revalidateCartUi();
  }
  return result;
}

export async function removeCartItemAction(input: unknown) {
  const result = await runAction(
    Effect.gen(function* () {
      const data = yield* decodeInput(RemoveCartItemSchema, input);
      const cart = yield* CartService;
      return yield* cart.removeItem(data.itemId);
    }),
  );
  if (result.success) {
    revalidateCartUi();
  }
  return result;
}

export async function checkoutAction(input: unknown) {
  const result = await runAction(
    Effect.gen(function* () {
      const data = yield* decodeInput(CheckoutSchema, input);
      const checkout = yield* CheckoutService;
      return yield* checkout.checkout(data.email);
    }),
  );

  if (!result.success) {
    return result;
  }

  updateTag("products");
  revalidateCartUi();

  if (result.data.provider === "stripe") {
    redirect(result.data.url);
  }

  redirect(
    `/order/confirmation/${result.data.orderId}?token=${encodeURIComponent(result.data.accessToken)}`,
  );
}
