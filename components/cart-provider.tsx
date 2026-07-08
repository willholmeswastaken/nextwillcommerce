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

type OpenWithCartOptions = {
  /** Prefer highlighting the line for this variant (add-to-cart). */
  variantId?: string;
  highlightItemId?: string;
};

type CartContextValue = {
  isOpen: boolean;
  cart: CartWithItems | null;
  itemCount: number;
  isRefreshing: boolean;
  /** True until server cart count has been provided (avoids a false zero badge). */
  countReady: boolean;
  loadError: string | null;
  highlightedItemId: string | null;
  open: () => void;
  close: () => void;
  openWithCart: (cart: CartWithItems, options?: OpenWithCartOptions) => void;
  setCart: (cart: CartWithItems) => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function findHighlightItemId(
  next: CartWithItems,
  options?: OpenWithCartOptions,
): string | null {
  if (options?.highlightItemId) {
    return options.highlightItemId;
  }

  if (options?.variantId) {
    return (
      next.items.find((item) => item.variantId === options.variantId)?.id ??
      null
    );
  }

  return next.items[0]?.id ?? null;
}

export function CartProvider({
  children,
  initialCount = 0,
  countReady = true,
}: {
  children: ReactNode;
  initialCount?: number;
  /** Set false in Suspense fallbacks before the server cart count is known. */
  countReady?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCartState] = useState<CartWithItems | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const cartRef = useRef(cart);
  cartRef.current = cart;

  const setCart = useCallback((next: CartWithItems) => {
    setCartState(next);
    setLoadError(null);
  }, []);

  const refresh = useCallback(async () => {
    return new Promise<void>((resolve) => {
      startRefresh(async () => {
        const result = await getCartAction();
        if (result.success) {
          setCartState(result.data);
          setLoadError(null);
        } else {
          setLoadError(result.error.message);
        }
        resolve();
      });
    });
  }, []);

  const open = useCallback(() => {
    setHighlightedItemId(null);
    setLoadError(null);
    setIsOpen(true);
    startRefresh(async () => {
      const result = await getCartAction();
      if (result.success) {
        setCartState(result.data);
        setLoadError(null);
      } else {
        setLoadError(result.error.message);
      }
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedItemId(null);
    setLoadError(null);
  }, []);

  const openWithCart = useCallback(
    (next: CartWithItems, options?: OpenWithCartOptions) => {
      setCartState(next);
      setLoadError(null);
      setHighlightedItemId(findHighlightItemId(next, options));
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
      countReady,
      loadError,
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
      countReady,
      loadError,
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
