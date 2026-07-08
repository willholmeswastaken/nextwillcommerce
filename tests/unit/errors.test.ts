import { describe, expect, it } from "vitest";
import { Schema } from "effect";
import {
  AddToCartSchema,
  CheckoutSchema,
  toActionError,
  OutOfStock,
} from "@/app/server/lib/errors";
import { formatMoney } from "@/lib/utils";

describe("validation schemas", () => {
  it("decodes add to cart input", () => {
    const result = Schema.decodeUnknownSync(AddToCartSchema)({
      variantId: "var_1",
      quantity: 2,
    });
    expect(result).toEqual({ variantId: "var_1", quantity: 2 });
  });

  it("defaults quantity to 1", () => {
    const result = Schema.decodeUnknownSync(AddToCartSchema)({
      variantId: "var_1",
    });
    expect(result.quantity).toBe(1);
  });

  it("rejects invalid checkout email", () => {
    expect(() =>
      Schema.decodeUnknownSync(CheckoutSchema)({ email: "not-an-email" }),
    ).toThrow();
  });
});

describe("error mapping", () => {
  it("maps tagged errors to action results", () => {
    const result = toActionError(
      new OutOfStock({ variantId: "v1", available: 1, requested: 5 }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("OutOfStock");
    }
  });
});

describe("formatMoney", () => {
  it("formats cents as USD", () => {
    expect(formatMoney(12900)).toBe("$129.00");
  });
});
