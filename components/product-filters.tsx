import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  PRICE_BANDS,
  hasActiveFilters,
  productsHref,
  type CatalogQuery,
} from "@/lib/catalog-query";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "flex h-9 items-center justify-between rounded-full border px-3 text-sm transition",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card hover:bg-accent-soft",
      )}
    >
      {children}
    </Link>
  );
}

export function ProductFilters({
  categories,
  query,
}: {
  categories: CategoryOption[];
  query: CatalogQuery;
}) {
  return (
    <nav aria-label="Filters" className="space-y-7">
      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Category
        </p>
        <div className="flex flex-col gap-2">
          <FilterLink href={productsHref({ ...query, category: undefined, page: 1 })} active={!query.category}>
            All kit
          </FilterLink>
          {categories.map((category) => (
            <FilterLink
              key={category.id}
              href={productsHref({
                ...query,
                category:
                  query.category === category.slug ? undefined : category.slug,
                page: 1,
              })}
              active={query.category === category.slug}
            >
              {category.name}
            </FilterLink>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Price
        </p>
        <div className="flex flex-col gap-2">
          {PRICE_BANDS.map((band) => (
            <FilterLink
              key={band.id}
              href={productsHref({
                ...query,
                price: query.price === band.id ? undefined : band.id,
                page: 1,
              })}
              active={query.price === band.id}
            >
              {band.label}
            </FilterLink>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Offers & stock
        </p>
        <div className="flex flex-col gap-2">
          <FilterLink
            href={productsHref({ ...query, sale: !query.sale, page: 1 })}
            active={query.sale}
          >
            On sale
          </FilterLink>
          <FilterLink
            href={productsHref({ ...query, inStock: !query.inStock, page: 1 })}
            active={query.inStock}
          >
            In stock
          </FilterLink>
        </div>
      </div>

      {hasActiveFilters(query) ? (
        <Link
          href="/products"
          prefetch
          className="inline-flex text-sm text-accent underline-offset-4 hover:underline"
        >
          Clear all filters
        </Link>
      ) : null}
    </nav>
  );
}
