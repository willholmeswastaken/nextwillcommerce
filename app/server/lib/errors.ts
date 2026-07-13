import { Data, Schema, Runtime, Cause, Option } from "effect";

export class ProductNotFound extends Data.TaggedError("ProductNotFound")<{
  slug?: string;
  id?: string;
}> {}

export class VariantNotFound extends Data.TaggedError("VariantNotFound")<{
  variantId: string;
}> {}

export class OutOfStock extends Data.TaggedError("OutOfStock")<{
  variantId: string;
  available: number;
  requested: number;
}> {}

export class CartNotFound extends Data.TaggedError("CartNotFound")<{
  cartId?: string;
}> {}

export class CartItemNotFound extends Data.TaggedError("CartItemNotFound")<{
  itemId: string;
}> {}

export class OrderNotFound extends Data.TaggedError("OrderNotFound")<{
  orderId: string;
}> {}

export class Unauthorized extends Data.TaggedError("Unauthorized")<{
  message?: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}

export class CheckoutError extends Data.TaggedError("CheckoutError")<{
  message: string;
}> {}

export type AppError =
  | ProductNotFound
  | VariantNotFound
  | OutOfStock
  | CartNotFound
  | CartItemNotFound
  | OrderNotFound
  | Unauthorized
  | ValidationError
  | CheckoutError;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { type: string; message: string } };

/** Effect.runPromise wraps failures in FiberFailure — unwrap to the tagged error. */
function unwrapActionError(error: unknown): unknown {
  if (!Runtime.isFiberFailure(error)) {
    return error;
  }
  const cause = error[Runtime.FiberFailureCauseId];
  const failure = Cause.failureOption(cause);
  if (Option.isSome(failure)) {
    return failure.value;
  }
  const defect = Cause.dieOption(cause);
  if (Option.isSome(defect)) {
    return defect.value;
  }
  return error;
}

export function toActionError(error: unknown): ActionResult<never> {
  const unwrapped = unwrapActionError(error);
  if (unwrapped && typeof unwrapped === "object" && "_tag" in unwrapped) {
    const tagged = unwrapped as { _tag: string; message?: string };
    const safeMessages: Record<string, string> = {
      OutOfStock: "Not enough inventory for one or more items",
      CartNotFound: "Cart not found",
      CartItemNotFound: "Cart item not found",
      VariantNotFound: "Product variant not found",
      ProductNotFound: "Product not found",
      OrderNotFound: "Order not found",
      Unauthorized: "Please sign in to continue",
      ValidationError: tagged.message ?? "Invalid input",
      CheckoutError: tagged.message ?? "Checkout failed",
      DatabaseError: "Something went wrong. Please try again.",
    };
    return {
      success: false,
      error: {
        type: tagged._tag,
        message: safeMessages[tagged._tag] ?? "Something went wrong",
      },
    };
  }
  return {
    success: false,
    error: {
      type: "UnknownError",
      message: "Something went wrong",
    },
  };
}

export const AddToCartSchema = Schema.Struct({
  variantId: Schema.String,
  quantity: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.positive()), {
    default: () => 1,
  }),
});

export const UpdateCartItemSchema = Schema.Struct({
  itemId: Schema.String,
  quantity: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
});

export const RemoveCartItemSchema = Schema.Struct({
  itemId: Schema.String.pipe(Schema.minLength(1)),
});

export const CheckoutSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});

export type AddToCartInput = Schema.Schema.Type<typeof AddToCartSchema>;
export type UpdateCartItemInput = Schema.Schema.Type<typeof UpdateCartItemSchema>;
export type RemoveCartItemInput = Schema.Schema.Type<typeof RemoveCartItemSchema>;
export type CheckoutInput = Schema.Schema.Type<typeof CheckoutSchema>;
