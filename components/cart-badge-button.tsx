"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartOptional } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

export function CartBadgeButton() {
  const cart = useCartOptional();

  if (!cart) {
    return (
      <Link
        href="/cart"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:bg-accent-soft"
        aria-label="Cart"
      >
        <ShoppingBag className="h-4 w-4" />
      </Link>
    );
  }

  const { open, itemCount, isOpen } = cart;

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:bg-accent-soft",
        isOpen && "bg-accent-soft ring-2 ring-ring/30",
      )}
      aria-label={`Cart with ${itemCount} items`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <ShoppingBag className="h-4 w-4" />
      {itemCount > 0 ? (
        <span
          key={itemCount}
          className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-cart-badge items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
