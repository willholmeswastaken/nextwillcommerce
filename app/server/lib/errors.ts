import { Data, Schema } from "effect";

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

export function toActionError(error: unknown): ActionResult<never> {
  if (error && typeof error === "object" && "_tag" in error) {
    const tagged = error as { _tag: string; message?: string };
    return {
      success: false,
      error: {
        type: tagged._tag,
        message: tagged.message ?? tagged._tag,
      },
    };
  }
  return {
    success: false,
    error: {
      type: "UnknownError",
      message: error instanceof Error ? error.message : "Something went wrong",
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

export const CheckoutSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});

export type AddToCartInput = Schema.Schema.Type<typeof AddToCartSchema>;
export type UpdateCartItemInput = Schema.Schema.Type<typeof UpdateCartItemSchema>;
export type CheckoutInput = Schema.Schema.Type<typeof CheckoutSchema>;
