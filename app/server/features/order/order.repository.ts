import "server-only";
import { Context, Effect, Layer } from "effect";
import { eq, desc, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  orders,
  orderItems,
  productVariants,
  cartItems,
  type Order,
  type OrderItem,
} from "@/drizzle/schema";
import {
  DatabaseError,
  DatabaseService,
  tryDb,
} from "@/app/server/features/shared/database";
import { OrderNotFound, OutOfStock } from "@/app/server/lib/errors";
import { createOrderAccessToken } from "@/lib/order-access";

export type OrderWithItems = Order & { items: OrderItem[] };

type FulfillError = DatabaseError | OutOfStock | OrderNotFound;

function tryFulfill<A>(fn: () => Promise<A>) {
  return Effect.tryPromise({
    try: fn,
    catch: (cause): FulfillError => {
      if (cause instanceof OutOfStock) return cause;
      if (cause instanceof OrderNotFound) return cause;
      if (cause instanceof DatabaseError) return cause;
      return new DatabaseError({
        message: cause instanceof Error ? cause.message : "Database error",
        cause,
      });
    },
  });
}

export class OrderRepository extends Context.Tag("OrderRepository")<
  OrderRepository,
  {
    create: (data: {
      userId?: string | null;
      email: string;
      totalCents: number;
      currency?: string;
      paymentProvider: string;
      stripeSessionId?: string;
      status?: string;
      items: Array<{
        variantId: string;
        productName: string;
        variantName: string;
        unitPriceCents: number;
        quantity: number;
      }>;
    }) => Effect.Effect<OrderWithItems, DatabaseError | OutOfStock>;
    getById: (
      orderId: string,
    ) => Effect.Effect<OrderWithItems, OrderNotFound | DatabaseError>;
    listByUser: (
      userId: string,
    ) => Effect.Effect<OrderWithItems[], DatabaseError>;
    findByStripeSession: (
      sessionId: string,
    ) => Effect.Effect<OrderWithItems | null, DatabaseError>;
    /**
     * Atomically mark paid and decrement inventory. Idempotent if already paid.
     */
    markPaidAndDecrementInventory: (
      orderId: string,
    ) => Effect.Effect<
      OrderWithItems,
      OrderNotFound | OutOfStock | DatabaseError
    >;
    clearCartById: (cartId: string) => Effect.Effect<void, DatabaseError>;
  }
>() {}

export const OrderRepositoryLive = Layer.effect(
  OrderRepository,
  Effect.gen(function* () {
    const database = yield* DatabaseService;

    return OrderRepository.of({
      create: (data) =>
        tryFulfill(async () => {
          return database.transaction(async (tx) => {
            for (const item of data.items) {
              const locked = await tx.query.productVariants.findFirst({
                where: eq(productVariants.id, item.variantId),
                with: { product: true },
              });
              if (!locked?.product?.active) {
                throw new OutOfStock({
                  variantId: item.variantId,
                  available: 0,
                  requested: item.quantity,
                });
              }
              if (locked.inventory < item.quantity) {
                throw new OutOfStock({
                  variantId: item.variantId,
                  available: locked.inventory,
                  requested: item.quantity,
                });
              }
            }

            const id = nanoid();
            const accessToken = createOrderAccessToken();
            const [order] = await tx
              .insert(orders)
              .values({
                id,
                userId: data.userId ?? null,
                email: data.email,
                totalCents: data.totalCents,
                currency: data.currency ?? "USD",
                paymentProvider: data.paymentProvider,
                stripeSessionId: data.stripeSessionId,
                status: data.status ?? "pending",
                accessToken,
              })
              .returning();

            if (!order) {
              throw new DatabaseError({ message: "Failed to create order" });
            }

            const items = await tx
              .insert(orderItems)
              .values(
                data.items.map((item) => ({
                  id: nanoid(),
                  orderId: id,
                  ...item,
                })),
              )
              .returning();

            if (data.status === "paid") {
              for (const item of data.items) {
                const updated = await tx
                  .update(productVariants)
                  .set({
                    inventory: sql`${productVariants.inventory} - ${item.quantity}`,
                  })
                  .where(
                    and(
                      eq(productVariants.id, item.variantId),
                      sql`${productVariants.inventory} >= ${item.quantity}`,
                    ),
                  )
                  .returning({ id: productVariants.id });

                if (updated.length === 0) {
                  throw new OutOfStock({
                    variantId: item.variantId,
                    available: 0,
                    requested: item.quantity,
                  });
                }
              }
            }

            return { ...order, items };
          });
        }).pipe(
          Effect.mapError((err): DatabaseError | OutOfStock => {
            if (err instanceof OutOfStock) return err;
            if (err instanceof DatabaseError) return err;
            return new DatabaseError({
              message: "Failed to create order",
              cause: err,
            });
          }),
        ),

      getById: (orderId) =>
        Effect.gen(function* () {
          const order = yield* tryDb(() =>
            database.query.orders.findFirst({
              where: eq(orders.id, orderId),
              with: { items: true },
            }),
          );
          if (!order) {
            return yield* Effect.fail(new OrderNotFound({ orderId }));
          }
          return order as OrderWithItems;
        }),

      listByUser: (userId) =>
        tryDb(async () => {
          const rows = await database.query.orders.findMany({
            where: eq(orders.userId, userId),
            with: { items: true },
            orderBy: [desc(orders.createdAt)],
          });
          return rows as OrderWithItems[];
        }),

      findByStripeSession: (sessionId) =>
        tryDb(async () => {
          const order = await database.query.orders.findFirst({
            where: eq(orders.stripeSessionId, sessionId),
            with: { items: true },
          });
          return (order as OrderWithItems | undefined) ?? null;
        }),

      markPaidAndDecrementInventory: (orderId) =>
        tryFulfill(async () => {
          return database.transaction(async (tx) => {
            const order = await tx.query.orders.findFirst({
              where: eq(orders.id, orderId),
              with: { items: true },
            });
            if (!order) {
              throw new OrderNotFound({ orderId });
            }
            if (order.status === "paid") {
              return order as OrderWithItems;
            }

            for (const item of order.items) {
              const updated = await tx
                .update(productVariants)
                .set({
                  inventory: sql`${productVariants.inventory} - ${item.quantity}`,
                })
                .where(
                  and(
                    eq(productVariants.id, item.variantId),
                    sql`${productVariants.inventory} >= ${item.quantity}`,
                  ),
                )
                .returning({ id: productVariants.id });

              if (updated.length === 0) {
                throw new OutOfStock({
                  variantId: item.variantId,
                  available: 0,
                  requested: item.quantity,
                });
              }
            }

            const [row] = await tx
              .update(orders)
              .set({ status: "paid", updatedAt: new Date() })
              .where(eq(orders.id, orderId))
              .returning();

            if (!row) {
              throw new DatabaseError({ message: "Failed to mark order paid" });
            }

            return { ...row, items: order.items } as OrderWithItems;
          });
        }),

      clearCartById: (cartId) =>
        tryDb(async () => {
          await database.delete(cartItems).where(eq(cartItems.cartId, cartId));
        }),
    });
  }),
);
