import "server-only";
import { Context, Effect, Layer } from "effect";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  products,
  productVariants,
  categories,
  type Product,
  type ProductVariant,
  type Category,
} from "@/drizzle/schema";
import {
  DatabaseError,
  DatabaseService,
  tryDb,
} from "@/app/server/features/shared/database";
import { ProductNotFound } from "@/app/server/lib/errors";

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  categories: Category[];
};

export class ProductRepository extends Context.Tag("ProductRepository")<
  ProductRepository,
  {
    listActive: (opts?: {
      categorySlug?: string;
      featured?: boolean;
    }) => Effect.Effect<ProductWithVariants[], DatabaseError>;
    listActiveSlugs: () => Effect.Effect<string[], DatabaseError>;
    getBySlug: (
      slug: string,
    ) => Effect.Effect<ProductWithVariants, ProductNotFound | DatabaseError>;
    getById: (
      id: string,
    ) => Effect.Effect<ProductWithVariants, ProductNotFound | DatabaseError>;
    getVariantById: (
      variantId: string,
    ) => Effect.Effect<
      ProductVariant & { product: Product },
      ProductNotFound | DatabaseError
    >;
    listCategories: () => Effect.Effect<Category[], DatabaseError>;
  }
>() {}

const productWithRelations = {
  variants: true,
  productCategories: {
    with: { category: true },
  },
} as const;

type ProductRowWithRelations = Product & {
  variants: ProductVariant[];
  productCategories: { category: Category }[];
};

const toProductWithVariants = ({
  productCategories,
  variants,
  ...product
}: ProductRowWithRelations): ProductWithVariants => ({
  ...product,
  variants,
  categories: productCategories.map((link) => link.category),
});

export const ProductRepositoryLive = Layer.effect(
  ProductRepository,
  Effect.gen(function* () {
    const database = yield* DatabaseService;

    return ProductRepository.of({
      listActive: (opts) =>
        tryDb(async () => {
          const where = opts?.featured
            ? and(eq(products.active, true), eq(products.featured, true))
            : eq(products.active, true);

          let productRows = await database.query.products.findMany({
            where,
            orderBy: [desc(products.featured), desc(products.createdAt)],
            with: productWithRelations,
          });

          if (opts?.categorySlug) {
            productRows = productRows.filter((p) =>
              p.productCategories.some(
                (link) => link.category.slug === opts.categorySlug,
              ),
            );
          }

          return productRows.map(toProductWithVariants);
        }),

      listActiveSlugs: () =>
        tryDb(async () => {
          const rows = await database.query.products.findMany({
            where: eq(products.active, true),
            columns: { slug: true },
          });
          return rows.map((row) => row.slug);
        }),

      getBySlug: (slug) =>
        Effect.gen(function* () {
          const product = yield* tryDb(() =>
            database.query.products.findFirst({
              where: and(eq(products.slug, slug), eq(products.active, true)),
              with: productWithRelations,
            }),
          );
          if (!product) {
            return yield* Effect.fail(new ProductNotFound({ slug }));
          }

          return toProductWithVariants(product);
        }),

      getById: (id) =>
        Effect.gen(function* () {
          const product = yield* tryDb(() =>
            database.query.products.findFirst({
              where: and(eq(products.id, id), eq(products.active, true)),
              with: productWithRelations,
            }),
          );
          if (!product) {
            return yield* Effect.fail(new ProductNotFound({ id }));
          }

          return toProductWithVariants(product);
        }),

      getVariantById: (variantId) =>
        Effect.gen(function* () {
          const variant = yield* tryDb(() =>
            database.query.productVariants.findFirst({
              where: eq(productVariants.id, variantId),
              with: { product: true },
            }),
          );
          if (!variant || !variant.product || !variant.product.active) {
            return yield* Effect.fail(new ProductNotFound({ id: variantId }));
          }
          return variant as ProductVariant & { product: Product };
        }),

      listCategories: () =>
        tryDb(() =>
          database.query.categories.findMany({
            orderBy: [asc(categories.name)],
          }),
        ),
    });
  }),
);
