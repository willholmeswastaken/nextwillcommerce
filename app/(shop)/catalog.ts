import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { ProductService } from "@/app/server/features/product/product.service";

/**
 * Cached catalog queries — Instant Navigations Cache strategy.
 * No cookies/headers inside `'use cache'` so catalog pages can await
 * and render fully populated (see `/checkout` for the Stream demo).
 */
export async function getFeaturedProducts() {
  "use cache";
  cacheTag("products", "featured");
  cacheLife("hours");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.list({ featured: true });
    }),
  );
}

export async function getProducts(categorySlug?: string) {
  "use cache";
  cacheTag("products", categorySlug ? `category:${categorySlug}` : "all");
  cacheLife("hours");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.list(
        categorySlug ? { categorySlug } : undefined,
      );
    }),
  );
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheTag("products", `product:${slug}`);
  // Hours + updateTag("products") on checkout: client navigations stay
  // instant (5m stale) and cold PDPs do not block-regenerate after 1 hour.
  cacheLife("hours");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.getBySlug(slug);
    }),
  );
}

export async function getProductSlugs() {
  "use cache";
  cacheTag("products", "slugs");
  cacheLife("hours");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.listSlugs();
    }),
  );
}

export async function getRelatedProducts(slug: string, categorySlug?: string) {
  "use cache";
  cacheTag(
    "products",
    `related:${slug}`,
    categorySlug ? `category:${categorySlug}` : "all",
  );
  cacheLife("hours");

  const products = await getProducts(categorySlug);
  return products.filter((product) => product.slug !== slug).slice(0, 3);
}

export async function getCategories() {
  "use cache";
  cacheTag("categories");
  cacheLife("days");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.categories();
    }),
  );
}
