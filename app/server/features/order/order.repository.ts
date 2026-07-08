import "server-only";
import { Context, Effect, Layer } from "effect";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  orders,
  orderItems,
  type Order,
  type OrderItem,
} from "@/drizzle/schema";
import {
  DatabaseError,
  DatabaseService,
  tryDb,
} from "@/app/server/features/shared/database";
import { OrderNotFound } from "@/app/server/lib/errors";

export type OrderWithItems = Order & { items: OrderItem[] };

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
    }) => Effect.Effect<OrderWithItems, DatabaseError>;
    getById: (
      orderId: string,
    ) => Effect.Effect<OrderWithItems, OrderNotFound | DatabaseError>;
    listByUser: (
      userId: string,
    ) => Effect.Effect<OrderWithItems[], DatabaseError>;
    findByStripeSession: (
      sessionId: string,
    ) => Effect.Effect<OrderWithItems | null, DatabaseError>;
    markPaid: (orderId: string) => Effect.Effect<Order, DatabaseError>;
  }
>() {}

export const OrderRepositoryLive = Layer.effect(
  OrderRepository,
  Effect.gen(function* () {
    const database = yield* DatabaseService;

    return OrderRepository.of({
      create: (data) =>
        tryDb(async () => {
          const id = nanoid();
          const [order] = await database
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
            })
            .returning();

          const items = await database
            .insert(orderItems)
            .values(
              data.items.map((item) => ({
                id: nanoid(),
                orderId: id,
                ...item,
              })),
            )
            .returning();

          return { ...order!, items };
        }),

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

      markPaid: (orderId) =>
        tryDb(async () => {
          const [row] = await database
            .update(orders)
            .set({ status: "paid", updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning();
          return row!;
        }),
    });
  }),
);
