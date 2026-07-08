"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { getCartAction } from "@/app/(shop)/actions";
import type { CartWithItems } from "@/app/server/features/cart/cart.repository";
import { CartDrawer } from "@/components/cart-drawer";

type CartContextValue = {
  isOpen: boolean;
  cart: CartWithItems | null;
  itemCount: number;
  isRefreshing: boolean;
  highlightedItemId: string | null;
  open: () => void;
  close: () => void;
  openWithCart: (cart: CartWithItems, highlightItemId?: string) => void;
  setCart: (cart: CartWithItems) => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function findChangedItemId(
  previous: CartWithItems | null,
  next: CartWithItems,
): string | null {
  if (!previous) {
    return next.items[0]?.id ?? null;
  }

  for (const item of next.items) {
    const before = previous.items.find((line) => line.id === item.id);
    if (!before || before.quantity !== item.quantity) {
      return item.id;
    }
  }

  return next.items[0]?.id ?? null;
}

export function CartProvider({
  children,
  initialCount = 0,
}: {
  children: ReactNode;
  initialCount?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCartState] = useState<CartWithItems | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [isRefreshing, startRefresh] = useTransition();
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const setCart = useCallback((next: CartWithItems) => {
    setCartState(next);
  }, []);

  const refresh = useCallback(async () => {
    return new Promise<void>((resolve) => {
      startRefresh(async () => {
        const result = await getCartAction();
        if (result.success) {
          setCartState(result.data);
        }
        resolve();
      });
    });
  }, []);

  const open = useCallback(() => {
    setHighlightedItemId(null);
    setIsOpen(true);
    startRefresh(async () => {
      const result = await getCartAction();
      if (result.success) {
        setCartState(result.data);
      }
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedItemId(null);
  }, []);

  const openWithCart = useCallback(
    (next: CartWithItems, highlightItemId?: string) => {
      const highlight =
        highlightItemId ?? findChangedItemId(cartRef.current, next);
      setCartState(next);
      setHighlightedItemId(highlight);
      setIsOpen(true);
    },
    [],
  );

  const itemCount = cart?.itemCount ?? initialCount;

  const value = useMemo(
    () => ({
      isOpen,
      cart,
      itemCount,
      isRefreshing,
      highlightedItemId,
      open,
      close,
      openWithCart,
      setCart,
      refresh,
    }),
    [
      isOpen,
      cart,
      itemCount,
      isRefreshing,
      highlightedItemId,
      open,
      close,
      openWithCart,
      setCart,
      refresh,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export function useCartOptional() {
  return useContext(CartContext);
}
