import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/app/(shop)/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductsListingSkeleton } from "@/components/skeletons";

async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(category),
  ]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-2 text-sm ${
            !category
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card hover:bg-accent-soft"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              category === cat.slug
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:bg-accent-soft"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">
            No products in this category yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                preload={index < 3}
              />
            ))}
          </div>
        )}
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
          Browse the catalog — cached for instant navigations.
        </p>
      </div>

      <Suspense fallback={<ProductsListingSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
