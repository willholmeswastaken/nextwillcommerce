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

export type CheckoutResult =
  | { provider: "stripe"; url: string; orderId: string }
  | { provider: "mock"; orderId: string };

type CheckoutFail =
  | CartNotFound
  | CartItemNotFound
  | CheckoutError
  | OrderNotFound
  | OutOfStock
  | Unauthorized
  | VariantNotFound
  | DatabaseError;

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
    listMyOrders: () => Effect.Effect<
      OrderWithItems[],
      Unauthorized | DatabaseError
    >;
  }
>() {}

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

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
                  images: [item.variant.product.imageUrl],
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
            };
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

          yield* cartService.clear();

          return { provider: "mock" as const, orderId: order.id };
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

          yield* orders.markPaid(existing.id);
          yield* cartService.clear();
          return yield* orders.getById(existing.id);
        }),

      getOrder: (orderId) => orders.getById(orderId),

      listMyOrders: () =>
        Effect.gen(function* () {
          const session = yield* auth.requireSession();
          return yield* orders.listByUser(session.user.id);
        }),
    });
  }),
);
