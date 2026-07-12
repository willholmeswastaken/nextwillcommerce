"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
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
  setCart: (cart: CartWithItems | null) => void;
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

type CartProviderProps = {
  children: ReactNode;
  initialCount?: number;
  /** Set false in Suspense fallbacks before the server cart count is known. */
  countReady?: boolean;
};

/**
 * Route hooks must sit under their own Suspense — this provider is also used
 * as the root layout Suspense fallback, where usePathname would block prerender.
 */
export function CartProvider(props: CartProviderProps) {
  return (
    <Suspense fallback={<CartProviderTree {...props} routeKey={null} />}>
      <CartProviderRouted {...props} />
    </Suspense>
  );
}

function CartProviderRouted(props: CartProviderProps) {
  const pathname = usePathname();
  return <CartProviderTree {...props} routeKey={pathname} />;
}

function CartProviderTree({
  children,
  initialCount = 0,
  countReady = true,
  routeKey,
}: CartProviderProps & { routeKey: string | null }) {
  /** Open only while this matches the current route — closes on navigation. */
  const [openedForRoute, setOpenedForRoute] = useState<string | null>(null);
  const isOpen = routeKey !== null && openedForRoute === routeKey;
  const [cart, setCartState] = useState<CartWithItems | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  /** Bumped to ignore out-of-order getCartAction responses. */
  const fetchIdRef = useRef(0);

  const setCart = useCallback((next: CartWithItems | null) => {
    fetchIdRef.current += 1;
    setCartState(next);
    setLoadError(null);
  }, []);

  const refresh = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    return new Promise<void>((resolve) => {
      startRefresh(async () => {
        const result = await getCartAction();
        if (fetchId !== fetchIdRef.current) {
          resolve();
          return;
        }
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
    if (routeKey === null) return;
    const fetchId = ++fetchIdRef.current;
    setHighlightedItemId(null);
    setLoadError(null);
    setOpenedForRoute(routeKey);
    startRefresh(async () => {
      const result = await getCartAction();
      if (fetchId !== fetchIdRef.current) return;
      if (result.success) {
        setCartState(result.data);
        setLoadError(null);
      } else {
        setLoadError(result.error.message);
      }
    });
  }, [routeKey]);

  const close = useCallback(() => {
    setOpenedForRoute(null);
    setHighlightedItemId(null);
    setLoadError(null);
  }, []);

  const openWithCart = useCallback(
    (next: CartWithItems, options?: OpenWithCartOptions) => {
      if (routeKey === null) return;
      fetchIdRef.current += 1;
      setCartState(next);
      setLoadError(null);
      setHighlightedItemId(findHighlightItemId(next, options));
      setOpenedForRoute(routeKey);
    },
    [routeKey],
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
