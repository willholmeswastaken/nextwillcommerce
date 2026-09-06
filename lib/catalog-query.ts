export const CATALOG_PAGE_SIZE = 6;

export const CATALOG_SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number]["id"];

export const PRICE_BANDS = [
  { id: "under-50", label: "Under $50", min: 0, max: 4999 },
  { id: "50-100", label: "$50 – $100", min: 5000, max: 10000 },
  { id: "over-100", label: "Over $100", min: 10001, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export type CatalogSearchParams = {
  category?: string;
  sort?: string;
  page?: string;
  sale?: string;
  stock?: string;
  price?: string;
};

export type CatalogQuery = {
  category?: string;
  sort: CatalogSort;
  page: number;
  sale: boolean;
  inStock: boolean;
  price?: PriceBandId;
};

export type CatalogProductLike = {
  name: string;
  featured: boolean;
  createdAt: Date;
  variants: Array<{
    priceCents: number;
    compareAtCents: number | null;
    inventory: number;
  }>;
  categories: Array<{ slug: string }>;
};

const SORT_IDS = new Set<string>(CATALOG_SORTS.map((s) => s.id));
const PRICE_IDS = new Set<string>(PRICE_BANDS.map((b) => b.id));

export function lowestPriceCents(product: CatalogProductLike): number {
  return product.variants.reduce(
    (min, variant) => Math.min(min, variant.priceCents),
    product.variants[0]?.priceCents ?? 0,
  );
}

export function isOnSale(product: CatalogProductLike): boolean {
  return product.variants.some(
    (variant) =>
      variant.compareAtCents != null && variant.compareAtCents > variant.priceCents,
  );
}

export function isInStock(product: CatalogProductLike): boolean {
  return product.variants.some((variant) => variant.inventory > 0);
}

export function compareAtCents(product: CatalogProductLike): number | undefined {
  return product.variants.find((variant) => variant.compareAtCents)?.compareAtCents
    ?? undefined;
}

export function parseCatalogQuery(params: CatalogSearchParams): CatalogQuery {
  const sort = SORT_IDS.has(params.sort ?? "")
    ? (params.sort as CatalogSort)
    : "featured";
  const price = PRICE_IDS.has(params.price ?? "")
    ? (params.price as PriceBandId)
    : undefined;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);

  return {
    category: params.category || undefined,
    sort,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    sale: params.sale === "1",
    inStock: params.stock === "1",
    price,
  };
}

export function productsHref(query: Partial<CatalogQuery>): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.sale) params.set("sale", "1");
  if (query.inStock) params.set("stock", "1");
  if (query.price) params.set("price", query.price);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function hasActiveFilters(query: CatalogQuery): boolean {
  return Boolean(query.category || query.sale || query.inStock || query.price);
}

export function applyCatalogQuery<T extends CatalogProductLike>(
  products: T[],
  query: CatalogQuery,
  pageSize = CATALOG_PAGE_SIZE,
) {
  const band = PRICE_BANDS.find((item) => item.id === query.price);
  const filtered = products.filter((product) => {
    if (
      query.category &&
      !product.categories.some((category) => category.slug === query.category)
    ) {
      return false;
    }
    if (query.sale && !isOnSale(product)) return false;
    if (query.inStock && !isInStock(product)) return false;
    if (band) {
      const price = lowestPriceCents(product);
      if (price < band.min || price > band.max) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return lowestPriceCents(a) - lowestPriceCents(b);
      case "price-desc":
        return lowestPriceCents(b) - lowestPriceCents(a);
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "featured":
      default: {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
    query: { ...query, page },
  };
}
