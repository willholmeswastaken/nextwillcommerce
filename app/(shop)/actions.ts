"use server";

import { Effect } from "effect";
import { updateTag } from "next/cache";
import { CartService } from "@/app/server/features/cart/cart.service";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";
import { decodeInput, runAction } from "@/app/server/lib/action-builder";
import {
  AddToCartSchema,
  CheckoutSchema,
  UpdateCartItemSchema,
} from "@/app/server/lib/errors";
import { redirect } from "next/navigation";

export async function addToCartAction(input: unknown) {
  const result = await runAction(
    Effect.gen(function* () {
      const data = yield* decodeInput(AddToCartSchema, input);
      const cart = yield* CartService;
      return yield* cart.addItem(data);
    }),
  );
  if (result.success) {
    updateTag("cart");
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
    updateTag("cart");
  }
  return result;
}

export async function removeCartItemAction(itemId: string) {
  const result = await runAction(
    Effect.gen(function* () {
      const cart = yield* CartService;
      return yield* cart.removeItem(itemId);
    }),
  );
  if (result.success) {
    updateTag("cart");
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

  updateTag("cart");

  if (result.data.provider === "stripe") {
    redirect(result.data.url);
  }

  redirect(`/order/confirmation/${result.data.orderId}`);
}
