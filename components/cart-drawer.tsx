"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { Loader2, ShoppingBag, X } from "lucide-react";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/app/(shop)/actions";
import { useCart } from "@/components/cart-provider";
import { formatMoney, cn } from "@/lib/utils";
import type { CartWithItems } from "@/app/server/features/cart/cart.repository";

export function CartDrawer() {
  const { isOpen, cart, close, setCart, isRefreshing, loadError, refresh } =
    useCart();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="Close cart"
        className={cn(
          "absolute inset-0 bg-foreground/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-[-24px_0_60px_-28px_rgba(20,17,15,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          visible ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                Your cart
              </h2>
              <p className="text-xs text-muted">
                {isRefreshing
                  ? "Updating…"
                  : cart
                    ? `${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`
                    : loadError
                      ? "Couldn’t load cart"
                      : "Ready when you are"}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition hover:bg-accent-soft"
            aria-label="Close cart panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {isRefreshing ? (
            <DrawerLoading />
          ) : !cart && loadError ? (
            <DrawerError
              message={loadError}
              onRetry={refresh}
              pending={isRefreshing}
            />
          ) : !cart || cart.items.length === 0 ? (
            <EmptyDrawer onClose={close} />
          ) : (
            <DrawerContents
              cart={cart}
              onCartChange={setCart}
              onClose={close}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-muted">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm">Loading your cart…</p>
    </div>
  );
}

function DrawerError({
  message,
  onRetry,
  pending,
}: {
  message: string;
  onRetry: () => Promise<void>;
  pending: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <h3 className="text-lg font-semibold">Couldn’t load your cart</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">{message}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          void onRetry();
        }}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Retrying…
          </>
        ) : (
          "Try again"
        )}
      </button>
    </div>
  );
}

function EmptyDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft/60 text-accent">
        <ShoppingBag className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">Your cart is empty</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Browse the catalog and add something you love.
      </p>
      <Link
        href="/products"
        onClick={onClose}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition hover:brightness-110"
      >
        Continue shopping
      </Link>
    </div>
  );
}

function DrawerContents({
  cart,
  onCartChange,
  onClose,
}: {
  cart: CartWithItems;
  onCartChange: (cart: CartWithItems) => void;
  onClose: () => void;
}) {
  const { highlightedItemId } = useCart();
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {error ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {optimisticCart.items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex gap-3 rounded-2xl border border-border bg-background/70 p-3 transition-all duration-500",
              highlightedItemId === item.id &&
                "animate-cart-line-in border-accent/40 bg-accent-soft/30 shadow-[0_12px_30px_-20px_rgba(15,118,110,0.55)]",
            )}
            style={{ animationDelay: `${Math.min(index, 4) * 40}ms` }}
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-accent-soft/40">
              <Image
                src={item.variant.product.imageUrl}
                alt={item.variant.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.variant.product.slug}`}
                    onClick={onClose}
                    className="line-clamp-1 font-medium hover:text-accent"
                  >
                    {item.variant.product.name}
                  </Link>
                  <p className="text-xs text-muted">{item.variant.name}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatMoney(item.variant.priceCents * item.quantity)}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-2">
                <div className="inline-flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-sm disabled:opacity-40"
                    disabled={pending}
                    aria-label="Decrease quantity"
                    onClick={() => {
                      const next = Math.max(0, item.quantity - 1);
                      startTransition(async () => {
                        setError(null);
                        const nextCart: CartWithItems = {
                          ...optimisticCart,
                          items: optimisticCart.items
                            .map((line) =>
                              line.id === item.id
                                ? { ...line, quantity: next }
                                : line,
                            )
                            .filter((line) => line.quantity > 0),
                          itemCount: Math.max(0, optimisticCart.itemCount - 1),
                          subtotalCents: Math.max(
                            0,
                            optimisticCart.subtotalCents -
                              item.variant.priceCents,
                          ),
                        };
                        setOptimisticCart(nextCart);
                        const result = await updateCartItemAction({
                          itemId: item.id,
                          quantity: next,
                        });
                        if (result.success) {
                          onCartChange(result.data);
                        } else {
                          setError(result.error.message);
                        }
                      });
                    }}
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-sm disabled:opacity-40"
                    disabled={pending}
                    aria-label="Increase quantity"
                    onClick={() => {
                      startTransition(async () => {
                        setError(null);
                        const nextCart: CartWithItems = {
                          ...optimisticCart,
                          items: optimisticCart.items.map((line) =>
                            line.id === item.id
                              ? { ...line, quantity: line.quantity + 1 }
                              : line,
                          ),
                          itemCount: optimisticCart.itemCount + 1,
                          subtotalCents:
                            optimisticCart.subtotalCents +
                            item.variant.priceCents,
                        };
                        setOptimisticCart(nextCart);
                        const result = await updateCartItemAction({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        });
                        if (result.success) {
                          onCartChange(result.data);
                        } else {
                          setError(result.error.message);
                        }
                      });
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-muted underline-offset-2 hover:text-danger hover:underline disabled:opacity-40"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      setError(null);
                      const nextCart: CartWithItems = {
                        ...optimisticCart,
                        items: optimisticCart.items.filter(
                          (line) => line.id !== item.id,
                        ),
                        itemCount: Math.max(
                          0,
                          optimisticCart.itemCount - item.quantity,
                        ),
                        subtotalCents: Math.max(
                          0,
                          optimisticCart.subtotalCents -
                            item.variant.priceCents * item.quantity,
                        ),
                      };
                      setOptimisticCart(nextCart);
                      const result = await removeCartItemAction({
                        itemId: item.id,
                      });
                      if (result.success) {
                        onCartChange(result.data);
                      } else {
                        setError(result.error.message);
                      }
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-card px-5 py-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-base font-semibold tabular-nums">
            {formatMoney(optimisticCart.subtotalCents)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="mt-4 grid gap-2">
          <Link
            href="/checkout"
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            Checkout
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-background text-sm font-medium transition hover:bg-accent-soft"
          >
            Keep shopping
          </button>
        </div>
      </div>
    </>
  );
}
