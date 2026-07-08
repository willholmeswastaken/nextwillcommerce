"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/app/(shop)/actions";
import { formatMoney } from "@/lib/utils";
import type { CartWithItems } from "@/app/server/features/cart/cart.repository";

export function CartView({ cart }: { cart: CartWithItems }) {
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (optimisticCart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-muted">
          Browse the catalog and add something you love.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {error ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {optimisticCart.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-3xl border border-border bg-card p-4"
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-accent-soft/40">
              <Image
                src={item.variant.product.imageUrl}
                alt={item.variant.product.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${item.variant.product.slug}`}
                    className="font-semibold hover:text-accent"
                  >
                    {item.variant.product.name}
                  </Link>
                  <p className="text-sm text-muted">{item.variant.name}</p>
                </div>
                <p className="font-medium">
                  {formatMoney(item.variant.priceCents * item.quantity)}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-3 pt-3">
                <div className="inline-flex items-center rounded-full border border-border">
                  <button
                    type="button"
                    className="h-9 w-9 disabled:opacity-40"
                    disabled={pending}
                    onClick={() => {
                      const next = Math.max(0, item.quantity - 1);
                      startTransition(async () => {
                        setError(null);
                        setOptimisticCart({
                          ...optimisticCart,
                          items: optimisticCart.items
                            .map((line) =>
                              line.id === item.id
                                ? { ...line, quantity: next }
                                : line,
                            )
                            .filter((line) => line.quantity > 0),
                          itemCount: Math.max(
                            0,
                            optimisticCart.itemCount - 1,
                          ),
                          subtotalCents: Math.max(
                            0,
                            optimisticCart.subtotalCents -
                              item.variant.priceCents,
                          ),
                        });
                        const result = await updateCartItemAction({
                          itemId: item.id,
                          quantity: next,
                        });
                        if (!result.success) {
                          setError(result.error.message);
                        }
                      });
                    }}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="h-9 w-9 disabled:opacity-40"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        setError(null);
                        setOptimisticCart({
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
                        });
                        const result = await updateCartItemAction({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        });
                        if (!result.success) {
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
                  className="text-sm text-muted underline hover:text-danger"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      setError(null);
                      setOptimisticCart({
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
                      });
                      const result = await removeCartItemAction({
                        itemId: item.id,
                      });
                      if (!result.success) {
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

      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-[0_18px_50px_-34px_rgba(20,17,15,0.5)]">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium">
            {formatMoney(optimisticCart.subtotalCents)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Shipping and taxes calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground transition hover:brightness-110"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
