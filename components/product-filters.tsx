import { CatalogFilterChip, CatalogFilterLink } from "@/components/catalog-filter-link";
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
          <CatalogFilterChip href={productsHref({ ...query, category: undefined, page: 1 })} active={!query.category}>
            All kit
          </CatalogFilterChip>
          {categories.map((category) => (
            <CatalogFilterChip
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
            </CatalogFilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Price
        </p>
        <div className="flex flex-col gap-2">
          {PRICE_BANDS.map((band) => (
            <CatalogFilterChip
              key={band.id}
              href={productsHref({
                ...query,
                price: query.price === band.id ? undefined : band.id,
                page: 1,
              })}
              active={query.price === band.id}
            >
              {band.label}
            </CatalogFilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Offers & stock
        </p>
        <div className="flex flex-col gap-2">
          <CatalogFilterChip
            href={productsHref({ ...query, sale: !query.sale, page: 1 })}
            active={query.sale}
          >
            On sale
          </CatalogFilterChip>
          <CatalogFilterChip
            href={productsHref({ ...query, inStock: !query.inStock, page: 1 })}
            active={query.inStock}
          >
            In stock
          </CatalogFilterChip>
        </div>
      </div>

      {hasActiveFilters(query) ? (
        <CatalogFilterLink
          href="/products"
          className="inline-flex text-sm text-foreground underline-offset-4 hover:underline"
        >
          Clear all filters
        </CatalogFilterLink>
      ) : null}
    </nav>
  );
}
