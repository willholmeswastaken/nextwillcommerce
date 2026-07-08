"use client";

import { useOptimistic, useState, useTransition } from "react";
import { addToCartAction } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { ProductVariant } from "@/drizzle/schema";

export function AddToCartForm({
  variants,
  productName,
}: {
  variants: ProductVariant[];
  productName: string;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [optimisticLabel, setOptimisticLabel] = useOptimistic(
    "Add to cart",
    (_current, next: string) => next,
  );

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

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
                onClick={() => setSelectedId(variant.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-accent-soft"
                }`}
              >
                {variant.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight">
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
          disabled={!selected || selected.inventory < 1 || pending}
          onClick={() => {
            if (!selected) return;
            startTransition(async () => {
              setOptimisticLabel("Adding…");
              const result = await addToCartAction({
                variantId: selected.id,
                quantity: 1,
              });
              if (result.success) {
                setMessage(`${productName} added to cart`);
              } else {
                setMessage(result.error.message);
              }
            });
          }}
        >
          {pending ? optimisticLabel : "Add to cart"}
        </Button>
      </div>

      {message ? (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {message}
        </p>
      ) : null}
    </div>
  );
}
