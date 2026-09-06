"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import {
  CATALOG_SORTS,
  productsHref,
  type CatalogQuery,
  type CatalogSort,
} from "@/lib/catalog-query";

export function ProductSort({ query }: { query: CatalogQuery }) {
  const router = useRouter();
  const [sort, setSort] = useOptimistic(query.sort);
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        value={sort}
        aria-label="Sort products"
        onChange={(event) => {
          const nextSort = event.target.value as CatalogSort;
          const href = productsHref({
            ...query,
            sort: nextSort,
            page: 1,
          });
          startTransition(() => {
            setSort(nextSort);
            router.push(href, { scroll: false });
          });
        }}
        className="h-10 rounded-full border border-border bg-card px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
      >
        {CATALOG_SORTS.map((sort) => (
          <option key={sort.id} value={sort.id}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  );
}
