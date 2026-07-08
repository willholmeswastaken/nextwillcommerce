import "server-only";
import { Context, Effect, Layer } from "effect";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  carts,
  cartItems,
  productVariants,
  type Cart,
  type CartItem,
  type ProductVariant,
  type Product,
} from "@/drizzle/schema";
import {
  DatabaseError,
  DatabaseService,
  tryDb,
} from "@/app/server/features/shared/database";
import {
  CartItemNotFound,
  CartNotFound,
  OutOfStock,
  VariantNotFound,
} from "@/app/server/lib/errors";

export type CartLine = CartItem & {
  variant: ProductVariant & { product: Product };
};

export type CartWithItems = Cart & {
  items: CartLine[];
  subtotalCents: number;
  itemCount: number;
};

export class CartRepository extends Context.Tag("CartRepository")<
  CartRepository,
  {
    findByGuestId: (
      guestId: string,
    ) => Effect.Effect<Cart | null, DatabaseError>;
    findByUserId: (userId: string) => Effect.Effect<Cart | null, DatabaseError>;
    create: (data: {
      guestId?: string;
      userId?: string;
    }) => Effect.Effect<Cart, DatabaseError>;
    getWithItems: (
      cartId: string,
    ) => Effect.Effect<CartWithItems, CartNotFound | DatabaseError>;
    addItem: (data: {
      cartId: string;
      variantId: string;
      quantity: number;
    }) => Effect.Effect<CartItem, OutOfStock | VariantNotFound | DatabaseError>;
    updateItemQuantity: (data: {
      cartId: string;
      itemId: string;
      quantity: number;
    }) => Effect.Effect<
      CartItem | null,
      CartItemNotFound | OutOfStock | DatabaseError
    >;
    removeItem: (data: {
      cartId: string;
      itemId: string;
    }) => Effect.Effect<void, CartItemNotFound | DatabaseError>;
    clear: (cartId: string) => Effect.Effect<void, DatabaseError>;
    attachUser: (
      cartId: string,
      userId: string,
    ) => Effect.Effect<void, DatabaseError>;
    deleteCart: (cartId: string) => Effect.Effect<void, DatabaseError>;
  }
>() {}

async function loadCartWithItems(
  database: import("@/lib/db").Database,
  cartId: string,
): Promise<CartWithItems | null> {
  const cart = await database.query.carts.findFirst({
    where: eq(carts.id, cartId),
  });
  if (!cart) return null;

  const items = await database.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: {
      variant: {
        with: { product: true },
      },
    },
  });

  const lines = items as CartLine[];
  const subtotalCents = lines.reduce(
    (sum, item) => sum + item.variant.priceCents * item.quantity,
    0,
  );
  const itemCount = lines.reduce((sum, item) => sum + item.quantity, 0);

  return { ...cart, items: lines, subtotalCents, itemCount };
}

export const CartRepositoryLive = Layer.effect(
  CartRepository,
  Effect.gen(function* () {
    const database = yield* DatabaseService;

    return CartRepository.of({
      findByGuestId: (guestId) =>
        tryDb(() =>
          database.query.carts.findFirst({
            where: eq(carts.guestId, guestId),
          }),
        ).pipe(Effect.map((c) => c ?? null)),

      findByUserId: (userId) =>
        tryDb(() =>
          database.query.carts.findFirst({
            where: eq(carts.userId, userId),
          }),
        ).pipe(Effect.map((c) => c ?? null)),

      create: (data) =>
        tryDb(async () => {
          const id = nanoid();
          const [row] = await database
            .insert(carts)
            .values({
              id,
              guestId: data.guestId,
              userId: data.userId,
            })
            .returning();
          return row!;
        }),

      getWithItems: (cartId) =>
        Effect.gen(function* () {
          const cart = yield* tryDb(() => loadCartWithItems(database, cartId));
          if (!cart) {
            return yield* Effect.fail(new CartNotFound({ cartId }));
          }
          return cart;
        }),

      addItem: ({ cartId, variantId, quantity }) =>
        Effect.gen(function* () {
          const variant = yield* tryDb(() =>
            database.query.productVariants.findFirst({
              where: eq(productVariants.id, variantId),
              with: { product: true },
            }),
          );
          if (!variant || !variant.product?.active) {
            return yield* Effect.fail(new VariantNotFound({ variantId }));
          }

          const existing = yield* tryDb(() =>
            database.query.cartItems.findFirst({
              where: and(
                eq(cartItems.cartId, cartId),
                eq(cartItems.variantId, variantId),
              ),
            }),
          );

          const nextQty = (existing?.quantity ?? 0) + quantity;
          if (nextQty > variant.inventory) {
            return yield* Effect.fail(
              new OutOfStock({
                variantId,
                available: variant.inventory,
                requested: nextQty,
              }),
            );
          }

          if (existing) {
            return yield* tryDb(async () => {
              const [row] = await database
                .update(cartItems)
                .set({ quantity: nextQty, updatedAt: new Date() })
                .where(
                  and(
                    eq(cartItems.id, existing.id),
                    eq(cartItems.cartId, cartId),
                  ),
                )
                .returning();
              if (!row) {
                throw new Error("Failed to update cart item");
              }
              return row;
            });
          }

          return yield* tryDb(async () => {
            const [row] = await database
              .insert(cartItems)
              .values({
                id: nanoid(),
                cartId,
                variantId,
                quantity,
              })
              .returning();
            if (!row) {
              throw new Error("Failed to insert cart item");
            }
            return row;
          });
        }),

      updateItemQuantity: ({ cartId, itemId, quantity }) =>
        Effect.gen(function* () {
          const item = yield* tryDb(() =>
            database.query.cartItems.findFirst({
              where: and(
                eq(cartItems.id, itemId),
                eq(cartItems.cartId, cartId),
              ),
              with: { variant: true },
            }),
          );
          if (!item) {
            return yield* Effect.fail(new CartItemNotFound({ itemId }));
          }

          if (quantity === 0) {
            yield* tryDb(async () => {
              await database
                .delete(cartItems)
                .where(
                  and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)),
                );
            });
            return null;
          }

          if (quantity > item.variant.inventory) {
            return yield* Effect.fail(
              new OutOfStock({
                variantId: item.variantId,
                available: item.variant.inventory,
                requested: quantity,
              }),
            );
          }

          return yield* tryDb(async () => {
            const [row] = await database
              .update(cartItems)
              .set({ quantity, updatedAt: new Date() })
              .where(
                and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)),
              )
              .returning();
            if (!row) {
              throw new Error("Failed to update cart item");
            }
            return row;
          });
        }),

      removeItem: ({ cartId, itemId }) =>
        Effect.gen(function* () {
          const item = yield* tryDb(() =>
            database.query.cartItems.findFirst({
              where: and(
                eq(cartItems.id, itemId),
                eq(cartItems.cartId, cartId),
              ),
            }),
          );
          if (!item) {
            return yield* Effect.fail(new CartItemNotFound({ itemId }));
          }
          yield* tryDb(async () => {
            await database
              .delete(cartItems)
              .where(
                and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)),
              );
          });
        }),

      clear: (cartId) =>
        tryDb(async () => {
          await database.delete(cartItems).where(eq(cartItems.cartId, cartId));
        }),

      attachUser: (cartId, userId) =>
        tryDb(async () => {
          await database
            .update(carts)
            .set({ userId, guestId: null, updatedAt: new Date() })
            .where(eq(carts.id, cartId));
        }),

      deleteCart: (cartId) =>
        tryDb(async () => {
          await database.delete(carts).where(eq(carts.id, cartId));
        }),
    });
  }),
);
