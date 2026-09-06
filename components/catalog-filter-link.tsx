"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function CatalogFilterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Link
      href={href}
      prefetch
      scroll={false}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        startTransition(() => {
          router.push(href, { scroll: false });
        });
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

export function CatalogFilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <CatalogFilterLink
      href={href}
      className={cn(
        "flex h-9 items-center justify-between rounded-full border px-3 text-sm transition",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card hover:bg-accent-soft",
      )}
    >
      {children}
    </CatalogFilterLink>
  );
}
