import "server-only";
import { cookies } from "next/headers";
import { Context, Effect, Layer } from "effect";
import { nanoid } from "nanoid";
import {
  CartRepository,
  type CartWithItems,
} from "@/app/server/features/cart/cart.repository";
import { AuthService } from "@/app/server/features/auth/auth.service";
import type { DatabaseError } from "@/app/server/features/shared/database";
import {
  CartItemNotFound,
  CartNotFound,
  OutOfStock,
  VariantNotFound,
} from "@/app/server/lib/errors";

const GUEST_COOKIE = "guest_cart_id";

type CartError =
  | CartNotFound
  | CartItemNotFound
  | OutOfStock
  | VariantNotFound
  | DatabaseError;

export class CartService extends Context.Tag("CartService")<
  CartService,
  {
    getOrCreateCart: () => Effect.Effect<CartWithItems, CartError>;
    getCart: () => Effect.Effect<CartWithItems | null, CartError>;
    addItem: (input: {
      variantId: string;
      quantity: number;
    }) => Effect.Effect<CartWithItems, CartError>;
    updateItem: (input: {
      itemId: string;
      quantity: number;
    }) => Effect.Effect<CartWithItems, CartError>;
    removeItem: (itemId: string) => Effect.Effect<CartWithItems, CartError>;
    mergeOnLogin: (
      userId: string,
    ) => Effect.Effect<CartWithItems | null, CartError>;
    clear: () => Effect.Effect<void, CartError>;
  }
>() {}

const getGuestId = Effect.tryPromise({
  try: async () => {
    const jar = await cookies();
    return jar.get(GUEST_COOKIE)?.value ?? null;
  },
  catch: () => null,
}).pipe(Effect.orElseSucceed(() => null));

const setGuestId = (guestId: string) =>
  Effect.tryPromise({
    try: async () => {
      const jar = await cookies();
      jar.set(GUEST_COOKIE, guestId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    },
    catch: () => undefined,
  }).pipe(Effect.orElseSucceed(() => undefined));

const clearGuestId = Effect.tryPromise({
  try: async () => {
    const jar = await cookies();
    jar.delete(GUEST_COOKIE);
  },
  catch: () => undefined,
}).pipe(Effect.orElseSucceed(() => undefined));

export const CartServiceLive = Layer.effect(
  CartService,
  Effect.gen(function* () {
    const repo = yield* CartRepository;
    const auth = yield* AuthService;

    const resolveCartId = Effect.gen(function* () {
      const session = yield* auth.getSession();
      if (session?.user?.id) {
        const existing = yield* repo.findByUserId(session.user.id);
        if (existing) return existing.id;
        const created = yield* repo.create({ userId: session.user.id });
        return created.id;
      }

      let guestId = yield* getGuestId;
      if (!guestId) {
        guestId = nanoid();
        yield* setGuestId(guestId);
      }

      const existing = yield* repo.findByGuestId(guestId);
      if (existing) return existing.id;
      const created = yield* repo.create({ guestId });
      return created.id;
    });

    return CartService.of({
      getOrCreateCart: () =>
        Effect.gen(function* () {
          const cartId = yield* resolveCartId;
          return yield* repo.getWithItems(cartId);
        }),

      getCart: () =>
        Effect.gen(function* () {
          const session = yield* auth.getSession();
          if (session?.user?.id) {
            const cart = yield* repo.findByUserId(session.user.id);
            if (!cart) return null;
            return yield* repo.getWithItems(cart.id);
          }
          const guestId = yield* getGuestId;
          if (!guestId) return null;
          const cart = yield* repo.findByGuestId(guestId);
          if (!cart) return null;
          return yield* repo.getWithItems(cart.id);
        }),

      addItem: ({ variantId, quantity }) =>
        Effect.gen(function* () {
          const cartId = yield* resolveCartId;
          yield* repo.addItem({ cartId, variantId, quantity });
          return yield* repo.getWithItems(cartId);
        }),

      updateItem: ({ itemId, quantity }) =>
        Effect.gen(function* () {
          const cartId = yield* resolveCartId;
          yield* repo.updateItemQuantity({ cartId, itemId, quantity });
          return yield* repo.getWithItems(cartId);
        }),

      removeItem: (itemId) =>
        Effect.gen(function* () {
          const cartId = yield* resolveCartId;
          yield* repo.removeItem({ cartId, itemId });
          return yield* repo.getWithItems(cartId);
        }),

      mergeOnLogin: (userId) =>
        Effect.gen(function* () {
          const guestId = yield* getGuestId;
          const userCart = yield* repo.findByUserId(userId);

          if (!guestId) {
            if (!userCart) return null;
            return yield* repo.getWithItems(userCart.id);
          }

          const guestCart = yield* repo.findByGuestId(guestId);
          if (!guestCart) {
            yield* clearGuestId;
            if (!userCart) return null;
            return yield* repo.getWithItems(userCart.id);
          }

          if (!userCart) {
            yield* repo.attachUser(guestCart.id, userId);
            yield* clearGuestId;
            return yield* repo.getWithItems(guestCart.id);
          }

          const guestFull = yield* repo.getWithItems(guestCart.id);
          for (const item of guestFull.items) {
            yield* repo
              .addItem({
                cartId: userCart.id,
                variantId: item.variantId,
                quantity: item.quantity,
              })
              .pipe(Effect.catchAll(() => Effect.void));
          }
          yield* repo.deleteCart(guestCart.id);
          yield* clearGuestId;
          return yield* repo.getWithItems(userCart.id);
        }),

      clear: () =>
        Effect.gen(function* () {
          const session = yield* auth.getSession();
          if (session?.user?.id) {
            const cart = yield* repo.findByUserId(session.user.id);
            if (cart) yield* repo.clear(cart.id);
            return;
          }
          const guestId = yield* getGuestId;
          if (!guestId) return;
          const cart = yield* repo.findByGuestId(guestId);
          if (cart) yield* repo.clear(cart.id);
        }),
    });
  }),
);
