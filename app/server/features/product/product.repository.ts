import "server-only";
import { Context, Effect, Layer } from "effect";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import {
  products,
  productVariants,
  productCategories,
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

const hydrateProducts = (
  rows: Product[],
  variants: ProductVariant[],
  cats: Category[],
  links: { productId: string; categoryId: string }[],
): ProductWithVariants[] => {
  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }

  const catsByProduct = new Map<string, Category[]>();
  const catMap = new Map(cats.map((c) => [c.id, c]));
  for (const link of links) {
    const cat = catMap.get(link.categoryId);
    if (!cat) continue;
    const list = catsByProduct.get(link.productId) ?? [];
    list.push(cat);
    catsByProduct.set(link.productId, list);
  }

  return rows.map((p) => ({
    ...p,
    variants: variantsByProduct.get(p.id) ?? [],
    categories: catsByProduct.get(p.id) ?? [],
  }));
};

export const ProductRepositoryLive = Layer.effect(
  ProductRepository,
  Effect.gen(function* () {
    const database = yield* DatabaseService;

    return ProductRepository.of({
      listActive: (opts) =>
        tryDb(async () => {
          let productRows = await database.query.products.findMany({
            where: eq(products.active, true),
            orderBy: [desc(products.featured), desc(products.createdAt)],
          });

          if (opts?.featured) {
            productRows = productRows.filter((p) => p.featured);
          }

          if (opts?.categorySlug) {
            const category = await database.query.categories.findFirst({
              where: eq(categories.slug, opts.categorySlug),
            });
            if (!category) return [];
            const links = await database.query.productCategories.findMany({
              where: eq(productCategories.categoryId, category.id),
            });
            const ids = new Set(links.map((l) => l.productId));
            productRows = productRows.filter((p) => ids.has(p.id));
          }

          if (productRows.length === 0) return [];

          const ids = productRows.map((p) => p.id);
          const [variantRows, linkRows, categoryRows] = await Promise.all([
            database.query.productVariants.findMany({
              where: inArray(productVariants.productId, ids),
            }),
            database.query.productCategories.findMany({
              where: inArray(productCategories.productId, ids),
            }),
            database.query.categories.findMany(),
          ]);

          return hydrateProducts(
            productRows,
            variantRows,
            categoryRows,
            linkRows,
          );
        }),

      getBySlug: (slug) =>
        Effect.gen(function* () {
          const product = yield* tryDb(() =>
            database.query.products.findFirst({
              where: and(eq(products.slug, slug), eq(products.active, true)),
            }),
          );
          if (!product) {
            return yield* Effect.fail(new ProductNotFound({ slug }));
          }

          const [variantRows, linkRows, categoryRows] = yield* tryDb(() =>
            Promise.all([
              database.query.productVariants.findMany({
                where: eq(productVariants.productId, product.id),
              }),
              database.query.productCategories.findMany({
                where: eq(productCategories.productId, product.id),
              }),
              database.query.categories.findMany(),
            ]),
          );

          return hydrateProducts(
            [product],
            variantRows,
            categoryRows,
            linkRows,
          )[0]!;
        }),

      getById: (id) =>
        Effect.gen(function* () {
          const product = yield* tryDb(() =>
            database.query.products.findFirst({
              where: and(eq(products.id, id), eq(products.active, true)),
            }),
          );
          if (!product) {
            return yield* Effect.fail(new ProductNotFound({ id }));
          }

          const [variantRows, linkRows, categoryRows] = yield* tryDb(() =>
            Promise.all([
              database.query.productVariants.findMany({
                where: eq(productVariants.productId, product.id),
              }),
              database.query.productCategories.findMany({
                where: eq(productCategories.productId, product.id),
              }),
              database.query.categories.findMany(),
            ]),
          );

          return hydrateProducts(
            [product],
            variantRows,
            categoryRows,
            linkRows,
          )[0]!;
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
