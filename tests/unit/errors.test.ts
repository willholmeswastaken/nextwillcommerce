import { describe, expect, it } from "vitest";
import { Effect, Schema } from "effect";
import {
  AddToCartSchema,
  CheckoutSchema,
  RemoveCartItemSchema,
  toActionError,
  OutOfStock,
  CheckoutError,
} from "@/app/server/lib/errors";
import { formatMoney } from "@/lib/utils";
import { safeRedirectPath } from "@/lib/safe-redirect";
import {
  createOrderAccessToken,
  orderAccessTokensEqual,
} from "@/lib/order-access";

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

  it("requires itemId for remove", () => {
    expect(() =>
      Schema.decodeUnknownSync(RemoveCartItemSchema)({ itemId: "" }),
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
      expect(result.error.message).toBe(
        "Not enough inventory for one or more items",
      );
    }
  });

  it("does not leak database error details", () => {
    const result = toActionError({
      _tag: "DatabaseError",
      message: "relation orders does not exist",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(
        "Something went wrong. Please try again.",
      );
    }
  });

  it("unwraps Effect FiberFailure so CheckoutError messages surface", async () => {
    const fiberFailure = await Effect.runPromise(
      Effect.fail(
        new CheckoutError({
          message:
            "Payments are not configured. Set STRIPE_SECRET_KEY or ALLOW_MOCK_CHECKOUT=true.",
        }),
      ),
    ).then(
      () => {
        throw new Error("expected failure");
      },
      (error: unknown) => error,
    );

    const result = toActionError(fiberFailure);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("CheckoutError");
      expect(result.error.message).toMatch(/ALLOW_MOCK_CHECKOUT/);
    }
  });
});

describe("formatMoney", () => {
  it("formats cents as USD", () => {
    expect(formatMoney(12900)).toBe("$129.00");
  });
});

describe("safeRedirectPath", () => {
  it("allows relative paths", () => {
    expect(safeRedirectPath("/account/orders")).toBe("/account/orders");
  });

  it("rejects open redirects", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("\\evil")).toBe("/");
  });
});

describe("order access tokens", () => {
  it("compares equal tokens", () => {
    const token = createOrderAccessToken();
    expect(orderAccessTokensEqual(token, token)).toBe(true);
  });

  it("rejects mismatched tokens", () => {
    const a = createOrderAccessToken();
    const b = createOrderAccessToken();
    expect(orderAccessTokensEqual(a, b)).toBe(false);
  });
});
