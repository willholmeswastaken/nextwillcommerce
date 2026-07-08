import "server-only";
import { Context, Effect, Layer } from "effect";
import {
  ProductRepository,
  type ProductWithVariants,
} from "@/app/server/features/product/product.repository";
import type { Category, Product, ProductVariant } from "@/drizzle/schema";
import { ProductNotFound } from "@/app/server/lib/errors";
import type { DatabaseError } from "@/app/server/features/shared/database";

export class ProductService extends Context.Tag("ProductService")<
  ProductService,
  {
    list: (opts?: {
      categorySlug?: string;
      featured?: boolean;
    }) => Effect.Effect<ProductWithVariants[], DatabaseError>;
    getBySlug: (
      slug: string,
    ) => Effect.Effect<ProductWithVariants, ProductNotFound | DatabaseError>;
    getVariant: (
      variantId: string,
    ) => Effect.Effect<
      ProductVariant & { product: Product },
      ProductNotFound | DatabaseError
    >;
    categories: () => Effect.Effect<Category[], DatabaseError>;
  }
>() {}

export const ProductServiceLive = Layer.effect(
  ProductService,
  Effect.gen(function* () {
    const repo = yield* ProductRepository;
    return ProductService.of({
      list: (opts) => repo.listActive(opts),
      getBySlug: (slug) => repo.getBySlug(slug),
      getVariant: (variantId) => repo.getVariantById(variantId),
      categories: () => repo.listCategories(),
    });
  }),
);
