import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { ProductService } from "@/app/server/features/product/product.service";

/**
 * Cached catalog queries — Instant Navigations Cache strategy.
 * No cookies/headers inside `'use cache'` so catalog pages can await
 * and render fully populated (see `/cart` for the Stream demo).
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
  // Short TTL so inventory/pricing on PDPs stay reasonably fresh.
  cacheLife("minutes");

  return runtime.runPromise(
    Effect.gen(function* () {
      const products = yield* ProductService;
      return yield* products.getBySlug(slug);
    }),
  );
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
