"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { addToCartAction } from "@/app/(shop)/actions";
import { useCart } from "@/components/cart-provider";
import { cn, formatMoney } from "@/lib/utils";

type QuickAddVariant = {
  id: string;
  name: string;
  priceCents: number;
  inventory: number;
};

export function QuickAdd({
  productName,
  variants,
}: {
  productName: string;
  variants: QuickAddVariant[];
}) {
  const inStock = variants.filter((variant) => variant.inventory > 0);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const { openWithCart } = useCart();

  const addVariant = (variant: QuickAddVariant) => {
    setError(null);
    setJustAdded(false);
    startTransition(async () => {
      const result = await addToCartAction({
        variantId: variant.id,
        quantity: 1,
      });
      if (result.success) {
        setJustAdded(true);
        setPicking(false);
        openWithCart(result.data, { variantId: variant.id });
        window.setTimeout(() => setJustAdded(false), 1600);
      } else {
        setError(result.error.message);
      }
    });
  };

  if (inStock.length === 0) {
    return (
      <p className="rounded-full border border-border bg-background/80 px-3 py-2 text-center text-xs uppercase tracking-wide text-muted">
        Sold out
      </p>
    );
  }

  if (inStock.length === 1) {
    const variant = inStock[0]!;
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => addVariant(variant)}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60",
            justAdded && "bg-accent text-accent-foreground",
          )}
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Adding…
            </span>
          ) : justAdded ? (
            <span className="inline-flex items-center gap-2 animate-cart-confirm">
              <Check className="h-4 w-4" aria-hidden />
              Added
            </span>
          ) : (
            `Quick add ${productName}`
          )}
        </button>
        {error ? (
          <p role="alert" className="text-xs text-danger">
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

  return (
    <div className="space-y-2">
      {picking ? (
        <div className="rounded-2xl border border-border bg-background/95 p-2 shadow-[0_16px_40px_-28px_rgba(22,18,14,0.45)]">
          <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted">
            Choose option
          </p>
          <div className="flex flex-col gap-1">
            {inStock.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={pending}
                onClick={() => addVariant(variant)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent-soft disabled:opacity-60"
              >
                <span>{variant.name}</span>
                <span className="tabular-nums text-muted">
                  {formatMoney(variant.priceCents)}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-1 w-full py-1.5 text-xs text-muted underline-offset-2 hover:underline"
            onClick={() => setPicking(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => setPicking(true)}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60",
            justAdded && "bg-accent text-accent-foreground",
          )}
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Adding…
            </span>
          ) : justAdded ? (
            <span className="inline-flex items-center gap-2 animate-cart-confirm">
              <Check className="h-4 w-4" aria-hidden />
              Added
            </span>
          ) : (
            `Quick add ${productName}`
          )}
        </button>
      )}
      {error ? (
        <p role="alert" className="text-xs text-danger">
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
