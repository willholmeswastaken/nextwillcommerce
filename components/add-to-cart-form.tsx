"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { addToCartAction } from "@/app/(shop)/actions";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/utils";
import type { ProductVariant } from "@/drizzle/schema";

export function AddToCartForm({
  variants,
  productName,
}: {
  variants: ProductVariant[];
  productName: string;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const { openWithCart } = useCart();

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const outOfStock = !selected || selected.inventory < 1;

  const addSelected = () => {
    if (!selected) return;
    setError(null);
    setJustAdded(false);
    startTransition(async () => {
      const result = await addToCartAction({
        variantId: selected.id,
        quantity: 1,
      });
      if (result.success) {
        setJustAdded(true);
        openWithCart(result.data, { variantId: selected.id });
        window.setTimeout(() => setJustAdded(false), 1600);
      } else {
        setError(result.error.message);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-muted">Select option</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const active = variant.id === selected?.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setSelectedId(variant.id);
                  setError(null);
                  setJustAdded(false);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-accent-soft",
                )}
              >
                {variant.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {selected ? formatMoney(selected.priceCents) : "—"}
            </p>
            <p className="text-sm text-muted">
              {selected
                ? selected.inventory > 0
                  ? `${selected.inventory} in stock`
                  : "Out of stock"
                : null}
            </p>
          </div>
          <Button
            size="lg"
            className={cn(
              "min-w-[10.5rem] transition-all duration-300",
              justAdded && "bg-foreground",
            )}
            disabled={outOfStock || pending}
            aria-busy={pending}
            onClick={addSelected}
          >
            <span className="relative inline-flex h-5 items-center justify-center">
              {pending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Adding…</span>
                </span>
              ) : justAdded ? (
                <span className="inline-flex items-center gap-2 animate-cart-confirm">
                  <Check className="h-4 w-4" aria-hidden />
                  <span>Added</span>
                </span>
              ) : (
                <span>Add to cart</span>
              )}
            </span>
          </Button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {pending
          ? `Adding ${productName} to cart`
          : justAdded
            ? `${productName} added to cart`
            : ""}
      </span>
    </div>
  );
}
