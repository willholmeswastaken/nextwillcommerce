import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getProductListing } from "@/app/(shop)/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { ProductPagination } from "@/components/product-pagination";
import { ProductSort } from "@/components/product-sort";
import { PromoBanner } from "@/components/promo-banner";
import { ProductsListingSkeleton } from "@/components/skeletons";
import { hasActiveFilters, type CatalogSearchParams } from "@/lib/catalog-query";

const LISTER_PROMOS: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    imageSrc: string;
    imageAlt: string;
  }
> = {
  footwear: {
    eyebrow: "Trail + tempo",
    title: "Shoes that stay quiet after dark.",
    description: "From city miles to rocky descents — shop the footwear wall.",
    href: "/products?category=footwear&sort=price-asc",
    imageSrc: "/products/trail-peak-boot.jpg",
    imageAlt: "Trail Peak Boot",
  },
  apparel: {
    eyebrow: "Layers",
    title: "Fleece, tees, and shells that disappear on the body.",
    description: "Cut for motion. Wash soft. Never bag out.",
    href: "/products?category=apparel",
    imageSrc: "/products/lumen-windbreaker.jpg",
    imageAlt: "Lumen Windbreaker",
  },
  accessories: {
    eyebrow: "Finishing kit",
    title: "Carry, sip, and finish the uniform.",
    description: "Daypacks, bottles, and the small pieces that complete a loop.",
    href: "/products?category=accessories",
    imageSrc: "/products/daypack-20l.jpg",
    imageAlt: "Daypack 20L",
  },
};

async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const raw = await searchParams;
  const [categories, listing] = await Promise.all([
    getCategories(),
    getProductListing(raw),
  ]);
  const query = listing.query;
  const promo = query.category ? LISTER_PROMOS[query.category] : undefined;
  const start = listing.total === 0 ? 0 : (listing.page - 1) * listing.pageSize + 1;
  const end = Math.min(listing.page * listing.pageSize, listing.total);

  return (
    <>
      {promo ? (
        <PromoBanner
          variant="inverse"
          className="mb-10"
          eyebrow={promo.eyebrow}
          title={promo.title}
          description={promo.description}
          cta="Browse this edit"
          href={promo.href}
          imageSrc={promo.imageSrc}
          imageAlt={promo.imageAlt}
        />
      ) : (
        <PromoBanner
          variant="inverse"
          className="mb-10"
          eyebrow="Lister note"
          title="Filter the wall. Quick-add from here."
          description="Sort by price, keep only sale pieces, or jump a page — then add a size without leaving the grid."
          cta="Shop sale kit"
          href="/products?sale=1"
        />
      )}

      <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr]">
        <details
          open={hasActiveFilters(query)}
          className="rounded-2xl border border-border bg-card p-4 lg:hidden"
        >
          <summary className="cursor-pointer text-sm font-medium">Filters</summary>
          <div className="pt-5">
            <ProductFilters categories={categories} query={query} />
          </div>
        </details>
        <aside className="hidden lg:block">
          <ProductFilters categories={categories} query={query} />
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {listing.total === 0
                ? "No products match these filters."
                : `Showing ${start}–${end} of ${listing.total}`}
            </p>
            <ProductSort query={query} />
          </div>

          {listing.items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border p-10 text-center text-muted">
              <p>Nothing here yet. Loosen a filter and try again.</p>
              {hasActiveFilters(query) ? (
                <Link
                  href="/products"
                  prefetch
                  scroll={false}
                  className="mt-4 inline-flex text-sm text-foreground underline"
                >
                  Clear all filters
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listing.items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preload={index < 3}
                />
              ))}
            </div>
          )}

          <ProductPagination
            query={query}
            page={listing.page}
            totalPages={listing.totalPages}
          />
        </div>
      </div>
    </>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
          Catalog
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
          Shop
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          The full wall — paginated, sortable, and built for buying without a
          detour through every product page.
        </p>
      </div>

      <Suspense fallback={<ProductsListingSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
