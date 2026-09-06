"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { addToCartAction } from "@/app/(shop)/actions";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

type QuickAddVariant = {
  id: string;
  name: string;
  priceCents: number;
  inventory: number;
};

function chipLabel(variants: QuickAddVariant[], variant: QuickAddVariant) {
  const primary = variant.name.split(" / ")[0]?.trim() || variant.name;
  const clash =
    variants.filter((item) => (item.name.split(" / ")[0]?.trim() || item.name) === primary)
      .length > 1;
  return clash ? variant.name : primary;
}

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
      <p className="pointer-events-auto absolute bottom-3 left-3 rounded-full bg-inverse/80 px-3 py-1.5 text-[11px] uppercase tracking-wide text-inverse-foreground">
        Sold out
      </p>
    );
  }

  if (picking && inStock.length > 1) {
    return (
      <>
        <div
          className="pointer-events-auto absolute inset-0"
          onClick={() => setPicking(false)}
        />
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 rounded-xl bg-inverse/92 p-3 text-inverse-foreground shadow-[0_16px_40px_-24px_rgba(23,23,23,0.65)] backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-inverse-foreground/65">
              Select a size
            </p>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-inverse-foreground/10"
              aria-label="Close size picker"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inStock.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={pending}
                onClick={() => addVariant(variant)}
                className="inline-flex h-9 min-w-10 items-center justify-center rounded-lg bg-inverse-foreground/12 px-2.5 text-xs font-medium transition hover:bg-inverse-foreground hover:text-inverse disabled:opacity-50"
              >
                {chipLabel(inStock, variant)}
              </button>
            ))}
          </div>
          {error ? (
            <p role="alert" className="mt-2 text-xs text-red-200">
              {error}
            </p>
          ) : null}
          <span className="sr-only" aria-live="polite">
            {pending ? `Adding ${productName} to cart` : ""}
          </span>
        </div>
      </>
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-3 right-3 flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-label={`Quick add ${productName}`}
        onClick={() => {
          if (inStock.length === 1) {
            addVariant(inStock[0]!);
            return;
          }
          setPicking(true);
        }}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full bg-inverse text-inverse-foreground shadow-[0_10px_24px_-12px_rgba(23,23,23,0.7)] transition hover:scale-105 disabled:opacity-60",
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : justAdded ? (
          <Check className="h-4 w-4 animate-cart-confirm" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
      </button>
      {error ? (
        <p role="alert" className="rounded-md bg-card/90 px-2 py-1 text-xs text-danger">
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
