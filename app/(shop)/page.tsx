import Link from "next/link";
import { getFeaturedProducts } from "@/app/(shop)/catalog";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-12 sm:px-10 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Next.js 16.3 · Effect-TS · Instant Navigations
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          An ecommerce template that feels as fast as an SPA — without leaving
          the server.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">
          Cache Components, Partial Prefetching, and Effect-powered domain
          services give you typed backend logic and instant route shells out of
          the box.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            prefetch
            className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground"
          >
            Shop the catalog
          </Link>
          <Link
            href="/products/aero-runner"
            prefetch
            className="inline-flex h-12 items-center rounded-full border border-border bg-background px-6 text-sm font-medium"
          >
            View Aero Runner
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured products
            </h2>
            <p className="text-sm text-muted">
              Served from cached catalog queries.
            </p>
          </div>
          <Link href="/products" className="text-sm text-accent underline">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              preload={index < 3}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
