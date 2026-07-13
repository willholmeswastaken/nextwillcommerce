import "server-only";
import { Context, Effect, Layer } from "effect";
import Stripe from "stripe";
import {
  OrderRepository,
  type OrderWithItems,
} from "@/app/server/features/order/order.repository";
import { CartService } from "@/app/server/features/cart/cart.service";
import { AuthService } from "@/app/server/features/auth/auth.service";
import type { DatabaseError } from "@/app/server/features/shared/database";
import {
  CartItemNotFound,
  CartNotFound,
  CheckoutError,
  OrderNotFound,
  OutOfStock,
  Unauthorized,
  VariantNotFound,
} from "@/app/server/lib/errors";
import { orderAccessTokensEqual } from "@/lib/order-access";
import { toAbsoluteUrl } from "@/lib/utils";
import { resolveProductImageSrc } from "@/lib/product-image";

export type CheckoutResult =
  | { provider: "stripe"; url: string; orderId: string; accessToken: string }
  | { provider: "mock"; orderId: string; accessToken: string };

type CheckoutFail =
  | CartNotFound
  | CartItemNotFound
  | CheckoutError
  | OrderNotFound
  | OutOfStock
  | Unauthorized
  | VariantNotFound
  | DatabaseError;

function allowMockCheckout(): boolean {
  if (process.env.ALLOW_MOCK_CHECKOUT === "true") return true;
  return process.env.NODE_ENV !== "production";
}

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export class CheckoutService extends Context.Tag("CheckoutService")<
  CheckoutService,
  {
    checkout: (email: string) => Effect.Effect<CheckoutResult, CheckoutFail>;
    fulfillStripeSession: (
      sessionId: string,
    ) => Effect.Effect<OrderWithItems, CheckoutFail>;
    getOrder: (
      orderId: string,
    ) => Effect.Effect<OrderWithItems, OrderNotFound | DatabaseError>;
    getOrderForConfirmation: (
      orderId: string,
      accessToken: string,
    ) => Effect.Effect<
      OrderWithItems,
      OrderNotFound | Unauthorized | DatabaseError
    >;
    listMyOrders: () => Effect.Effect<
      OrderWithItems[],
      Unauthorized | DatabaseError
    >;
  }
>() {}

export const CheckoutServiceLive = Layer.effect(
  CheckoutService,
  Effect.gen(function* () {
    const orders = yield* OrderRepository;
    const cartService = yield* CartService;
    const auth = yield* AuthService;

    return CheckoutService.of({
      checkout: (email) =>
        Effect.gen(function* () {
          const cart = yield* cartService.getCart();
          if (!cart || cart.items.length === 0) {
            return yield* Effect.fail(new CartNotFound({}));
          }

          // Reject inactive products before payment.
          for (const item of cart.items) {
            if (!item.variant.product.active) {
              return yield* Effect.fail(
                new OutOfStock({
                  variantId: item.variantId,
                  available: 0,
                  requested: item.quantity,
                }),
              );
            }
            if (item.variant.inventory < item.quantity) {
              return yield* Effect.fail(
                new OutOfStock({
                  variantId: item.variantId,
                  available: item.variant.inventory,
                  requested: item.quantity,
                }),
              );
            }
          }

          const session = yield* auth.getSession();
          const stripe = getStripe();
          const baseUrl =
            process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

          if (stripe) {
            const lineItems = cart.items.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: "usd",
                unit_amount: item.variant.priceCents,
                product_data: {
                  name: `${item.variant.product.name} — ${item.variant.name}`,
                  images: [
                    toAbsoluteUrl(
                      resolveProductImageSrc(item.variant.product.imageUrl),
                      baseUrl,
                    ),
                  ],
                },
              },
            }));

            const checkoutSession = yield* Effect.tryPromise({
              try: () =>
                stripe.checkout.sessions.create({
                  mode: "payment",
                  customer_email: email,
                  line_items: lineItems,
                  success_url: `${baseUrl}/order/confirmation/{CHECKOUT_SESSION_ID}?provider=stripe`,
                  cancel_url: `${baseUrl}/cart`,
                  metadata: {
                    cartId: cart.id,
                    userId: session?.user?.id ?? "",
                  },
                }),
              catch: (cause) =>
                new CheckoutError({
                  message:
                    cause instanceof Error
                      ? cause.message
                      : "Failed to create Stripe session",
                }),
            });

            const order = yield* orders.create({
              userId: session?.user?.id,
              email,
              totalCents: cart.subtotalCents,
              paymentProvider: "stripe",
              stripeSessionId: checkoutSession.id,
              status: "pending",
              items: cart.items.map((item) => ({
                variantId: item.variantId,
                productName: item.variant.product.name,
                variantName: item.variant.name,
                unitPriceCents: item.variant.priceCents,
                quantity: item.quantity,
              })),
            });

            if (!checkoutSession.url) {
              return yield* Effect.fail(
                new CheckoutError({ message: "Stripe did not return a URL" }),
              );
            }

            return {
              provider: "stripe" as const,
              url: checkoutSession.url,
              orderId: order.id,
              accessToken: order.accessToken,
            };
          }

          if (!allowMockCheckout()) {
            return yield* Effect.fail(
              new CheckoutError({
                message:
                  "Payments are not configured. Set STRIPE_SECRET_KEY or ALLOW_MOCK_CHECKOUT=true.",
              }),
            );
          }

          const order = yield* orders.create({
            userId: session?.user?.id,
            email,
            totalCents: cart.subtotalCents,
            paymentProvider: "mock",
            status: "paid",
            items: cart.items.map((item) => ({
              variantId: item.variantId,
              productName: item.variant.product.name,
              variantName: item.variant.name,
              unitPriceCents: item.variant.priceCents,
              quantity: item.quantity,
            })),
          });

          yield* orders.clearCartById(cart.id);

          return {
            provider: "mock" as const,
            orderId: order.id,
            accessToken: order.accessToken,
          };
        }),

      fulfillStripeSession: (sessionId) =>
        Effect.gen(function* () {
          const existing = yield* orders.findByStripeSession(sessionId);
          if (!existing) {
            return yield* Effect.fail(
              new OrderNotFound({ orderId: sessionId }),
            );
          }
          if (existing.status === "paid") {
            return existing;
          }

          const stripe = getStripe();
          if (!stripe) {
            return yield* Effect.fail(
              new CheckoutError({ message: "Stripe is not configured" }),
            );
          }

          const session = yield* Effect.tryPromise({
            try: () => stripe.checkout.sessions.retrieve(sessionId),
            catch: (cause) =>
              new CheckoutError({
                message:
                  cause instanceof Error
                    ? cause.message
                    : "Failed to retrieve Stripe session",
              }),
          });

          if (session.payment_status !== "paid") {
            return yield* Effect.fail(
              new CheckoutError({ message: "Payment not completed" }),
            );
          }

          if (
            typeof session.amount_total === "number" &&
            session.amount_total !== existing.totalCents
          ) {
            return yield* Effect.fail(
              new CheckoutError({
                message: "Paid amount does not match order total",
              }),
            );
          }

          const paid = yield* orders.markPaidAndDecrementInventory(existing.id);

          const cartId = session.metadata?.cartId;
          if (cartId) {
            yield* orders.clearCartById(cartId);
          }

          return paid;
        }),

      getOrder: (orderId) => orders.getById(orderId),

      getOrderForConfirmation: (orderId, accessToken) =>
        Effect.gen(function* () {
          const order = yield* orders.getById(orderId);
          if (!orderAccessTokensEqual(order.accessToken, accessToken)) {
            return yield* Effect.fail(
              new Unauthorized({ message: "Invalid order access token" }),
            );
          }
          return order;
        }),

      listMyOrders: () =>
        Effect.gen(function* () {
          const session = yield* auth.requireSession();
          return yield* orders.listByUser(session.user.id);
        }),
    });
  }),
);
