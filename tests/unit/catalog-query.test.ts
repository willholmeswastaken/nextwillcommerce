import { describe, expect, it } from "vitest";
import {
  applyCatalogQuery,
  isOnSale,
  lowestPriceCents,
  parseCatalogQuery,
  productsHref,
  type CatalogProductLike,
} from "@/lib/catalog-query";

function product(
  overrides: Partial<CatalogProductLike> & { name: string },
): CatalogProductLike {
  return {
    featured: false,
    createdAt: new Date("2026-01-01"),
    variants: [{ priceCents: 4000, compareAtCents: null, inventory: 4 }],
    categories: [{ slug: "apparel" }],
    ...overrides,
  };
}

const catalog: CatalogProductLike[] = [
  product({
    name: "Aero Runner",
    featured: true,
    createdAt: new Date("2026-01-01"),
    variants: [{ priceCents: 12900, compareAtCents: 14900, inventory: 8 }],
    categories: [{ slug: "footwear" }],
  }),
  product({
    name: "Cloud Soft Tee",
    createdAt: new Date("2026-02-01"),
    variants: [{ priceCents: 3800, compareAtCents: null, inventory: 0 }],
    categories: [{ slug: "apparel" }],
  }),
  product({
    name: "Daypack 20L",
    featured: true,
    createdAt: new Date("2026-03-01"),
    variants: [{ priceCents: 9800, compareAtCents: null, inventory: 5 }],
    categories: [{ slug: "accessories" }],
  }),
  product({
    name: "Pulse Socks",
    createdAt: new Date("2026-04-01"),
    variants: [{ priceCents: 1800, compareAtCents: 2200, inventory: 20 }],
    categories: [{ slug: "apparel" }, { slug: "footwear" }],
  }),
];

describe("parseCatalogQuery", () => {
  it("applies defaults and ignores invalid values", () => {
    expect(parseCatalogQuery({})).toEqual({
      category: undefined,
      sort: "featured",
      page: 1,
      sale: false,
      inStock: false,
      price: undefined,
    });
    expect(
      parseCatalogQuery({
        category: "footwear",
        sort: "nope",
        page: "0",
        sale: "1",
        stock: "1",
        price: "under-50",
      }),
    ).toMatchObject({
      category: "footwear",
      sort: "featured",
      page: 1,
      sale: true,
      inStock: true,
      price: "under-50",
    });
  });
});

describe("productsHref", () => {
  it("omits default featured sort and page 1", () => {
    expect(productsHref({ sort: "featured", page: 1 })).toBe("/products");
    expect(
      productsHref({
        category: "footwear",
        sort: "price-asc",
        page: 2,
        sale: true,
        inStock: true,
        price: "over-100",
      }),
    ).toBe(
      "/products?category=footwear&sort=price-asc&page=2&sale=1&stock=1&price=over-100",
    );
  });
});

describe("applyCatalogQuery", () => {
  it("filters by category, sale, stock, and price band", () => {
    const sale = applyCatalogQuery(catalog, parseCatalogQuery({ sale: "1" }));
    expect(sale.items.map((p) => p.name)).toEqual(["Aero Runner", "Pulse Socks"]);
    expect(sale.items.every(isOnSale)).toBe(true);

    const stock = applyCatalogQuery(catalog, parseCatalogQuery({ stock: "1" }));
    expect(stock.items.map((p) => p.name)).not.toContain("Cloud Soft Tee");

    const cheap = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ price: "under-50" }),
    );
    expect(cheap.items.map((p) => p.name)).toEqual(["Pulse Socks", "Cloud Soft Tee"]);

    const footwear = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ category: "footwear" }),
    );
    expect(footwear.total).toBe(2);
  });

  it("sorts by price, name, and featured", () => {
    const byPrice = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ sort: "price-asc" }),
    );
    expect(byPrice.items.map((p) => p.name)).toEqual([
      "Pulse Socks",
      "Cloud Soft Tee",
      "Daypack 20L",
      "Aero Runner",
    ]);

    const featured = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ sort: "featured" }),
    );
    expect(featured.items[0]?.name).toBe("Daypack 20L");
    expect(featured.items[1]?.name).toBe("Aero Runner");
  });

  it("paginates and clamps the page", () => {
    const page1 = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ sort: "name" }),
      2,
    );
    expect(page1.items.map((p) => p.name)).toEqual(["Aero Runner", "Cloud Soft Tee"]);
    expect(page1.totalPages).toBe(2);

    const page3 = applyCatalogQuery(
      catalog,
      parseCatalogQuery({ sort: "name", page: "9" }),
      2,
    );
    expect(page3.page).toBe(2);
    expect(page3.items.map((p) => p.name)).toEqual(["Daypack 20L", "Pulse Socks"]);
  });
});

describe("lowestPriceCents", () => {
  it("uses the cheapest variant", () => {
    expect(
      lowestPriceCents(
        product({
          name: "Kit",
          variants: [
            { priceCents: 5200, compareAtCents: null, inventory: 1 },
            { priceCents: 3800, compareAtCents: null, inventory: 1 },
          ],
        }),
      ),
    ).toBe(3800);
  });
});
