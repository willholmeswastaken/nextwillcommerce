import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/app/(shop)/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";

async function CategoryFilters({
  active,
}: {
  active?: string;
}) {
  const categories = await getCategories();
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={`rounded-full border px-4 py-2 text-sm ${
          !active
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-card hover:bg-accent-soft"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className={`rounded-full border px-4 py-2 text-sm ${
            active === category.slug
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card hover:bg-accent-soft"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

async function ProductGrid({ category }: { category?: string }) {
  const products = await getProducts(category);
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">
        No products in this category yet.
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;

  return (
    <>
      <Suspense
        fallback={
          <div className="mb-8 h-10 w-full animate-pulse rounded-full bg-border/50" />
        }
      >
        <CategoryFilters active={category} />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid category={category} />
        </Suspense>
      </div>
    </>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
        <p className="mt-2 text-muted">
          Catalog pages use Cache + Suspense so navigations commit instantly.
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
