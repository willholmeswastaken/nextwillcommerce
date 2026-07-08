import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const CATEGORIES = [
  {
    id: "cat_apparel",
    name: "Apparel",
    slug: "apparel",
    description: "Everyday essentials with a performance cut.",
  },
  {
    id: "cat_footwear",
    name: "Footwear",
    slug: "footwear",
    description: "Lightweight shoes built for all-day wear.",
  },
  {
    id: "cat_accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Bags, bottles, and finishing touches.",
  },
] as const;

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  categoryIds: string[];
  variants: Array<{
    name: string;
    sku: string;
    priceCents: number;
    compareAtCents?: number;
    inventory: number;
  }>;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Aero Runner",
    slug: "aero-runner",
    description:
      "Breathable knit upper with a responsive foam midsole. Built for tempo runs and city miles.",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    featured: true,
    categoryIds: ["cat_footwear"],
    variants: [
      {
        name: "US 8 / Black",
        sku: "AERO-8-BLK",
        priceCents: 12900,
        compareAtCents: 14900,
        inventory: 24,
      },
      {
        name: "US 9 / Black",
        sku: "AERO-9-BLK",
        priceCents: 12900,
        compareAtCents: 14900,
        inventory: 18,
      },
      {
        name: "US 10 / White",
        sku: "AERO-10-WHT",
        priceCents: 12900,
        inventory: 12,
      },
    ],
  },
  {
    name: "Trail Peak Boot",
    slug: "trail-peak-boot",
    description:
      "Waterproof membrane, Vibram-inspired outsole, and a mid-cut collar for rocky terrain.",
    imageUrl:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80",
    featured: true,
    categoryIds: ["cat_footwear"],
    variants: [
      {
        name: "US 9 / Olive",
        sku: "TRAIL-9-OLV",
        priceCents: 18900,
        inventory: 10,
      },
      {
        name: "US 10 / Olive",
        sku: "TRAIL-10-OLV",
        priceCents: 18900,
        inventory: 8,
      },
    ],
  },
  {
    name: "Cloud Soft Tee",
    slug: "cloud-soft-tee",
    description:
      "Ultra-soft organic cotton with a relaxed athletic fit. Washes soft, never bags out.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    featured: true,
    categoryIds: ["cat_apparel"],
    variants: [
      {
        name: "S / Bone",
        sku: "TEE-S-BONE",
        priceCents: 3800,
        inventory: 40,
      },
      {
        name: "M / Bone",
        sku: "TEE-M-BONE",
        priceCents: 3800,
        inventory: 55,
      },
      {
        name: "L / Ink",
        sku: "TEE-L-INK",
        priceCents: 3800,
        inventory: 32,
      },
    ],
  },
  {
    name: "Summit Fleece",
    slug: "summit-fleece",
    description:
      "Midweight recycled fleece with a quarter zip and thumb loops for cold morning starts.",
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    featured: false,
    categoryIds: ["cat_apparel"],
    variants: [
      {
        name: "M / Heather",
        sku: "FLC-M-HTH",
        priceCents: 7800,
        inventory: 20,
      },
      {
        name: "L / Heather",
        sku: "FLC-L-HTH",
        priceCents: 7800,
        inventory: 16,
      },
    ],
  },
  {
    name: "Velocity Shorts",
    slug: "velocity-shorts",
    description:
      "5-inch inseam with a bonded waistband and zip pocket. Moves with you, not against you.",
    imageUrl:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
    featured: false,
    categoryIds: ["cat_apparel"],
    variants: [
      {
        name: "S / Navy",
        sku: "SHORT-S-NVY",
        priceCents: 5200,
        inventory: 28,
      },
      {
        name: "M / Navy",
        sku: "SHORT-M-NVY",
        priceCents: 5200,
        inventory: 34,
      },
    ],
  },
  {
    name: "Daypack 20L",
    slug: "daypack-20l",
    description:
      "Weather-resistant shell, laptop sleeve, and a hidden water-bottle pocket. Commute ready.",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    featured: true,
    categoryIds: ["cat_accessories"],
    variants: [
      {
        name: "Slate",
        sku: "PACK-20-SLT",
        priceCents: 9800,
        inventory: 22,
      },
      {
        name: "Sand",
        sku: "PACK-20-SND",
        priceCents: 9800,
        inventory: 15,
      },
    ],
  },
  {
    name: "Insulated Bottle 750ml",
    slug: "insulated-bottle-750",
    description:
      "Double-wall vacuum steel that keeps drinks cold for 24 hours. Leak-proof flip lid.",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    featured: false,
    categoryIds: ["cat_accessories"],
    variants: [
      {
        name: "Matte Black",
        sku: "BTL-750-BLK",
        priceCents: 3600,
        inventory: 60,
      },
      {
        name: "Ocean",
        sku: "BTL-750-OCN",
        priceCents: 3600,
        inventory: 45,
      },
    ],
  },
  {
    name: "Merino Beanie",
    slug: "merino-beanie",
    description:
      "Fine-gauge merino that regulates temperature without the itch. One size, deep cuff.",
    imageUrl:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
    featured: false,
    categoryIds: ["cat_accessories", "cat_apparel"],
    variants: [
      {
        name: "Charcoal",
        sku: "BEAN-CHR",
        priceCents: 3200,
        inventory: 50,
      },
      {
        name: "Forest",
        sku: "BEAN-FOR",
        priceCents: 3200,
        inventory: 40,
      },
    ],
  },
  {
    name: "Studio Cap",
    slug: "studio-cap",
    description:
      "Structured six-panel with a moisture-wicking sweatband. Embroidery-ready crown.",
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    featured: false,
    categoryIds: ["cat_accessories"],
    variants: [
      {
        name: "Black",
        sku: "CAP-BLK",
        priceCents: 2800,
        inventory: 70,
      },
    ],
  },
  {
    name: "Lumen Windbreaker",
    slug: "lumen-windbreaker",
    description:
      "Packable ripstop shell with reflective hits and a two-way zipper. Blocks wind, not style.",
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    featured: true,
    categoryIds: ["cat_apparel"],
    variants: [
      {
        name: "M / Neon",
        sku: "WIND-M-NEO",
        priceCents: 11000,
        inventory: 14,
      },
      {
        name: "L / Neon",
        sku: "WIND-L-NEO",
        priceCents: 11000,
        inventory: 11,
      },
    ],
  },
  {
    name: "Grip Training Gloves",
    slug: "grip-training-gloves",
    description:
      "Open-palm design with silicone grip pads. Machine washable, touchscreen compatible.",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    featured: false,
    categoryIds: ["cat_accessories"],
    variants: [
      {
        name: "M",
        sku: "GLV-M",
        priceCents: 2400,
        inventory: 35,
      },
      {
        name: "L",
        sku: "GLV-L",
        priceCents: 2400,
        inventory: 30,
      },
    ],
  },
  {
    name: "Pulse Compression Socks",
    slug: "pulse-compression-socks",
    description:
      "Graduated compression with targeted cushioning under the ball of the foot.",
    imageUrl:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",
    featured: false,
    categoryIds: ["cat_apparel", "cat_footwear"],
    variants: [
      {
        name: "M / Pair",
        sku: "SOCK-M",
        priceCents: 1800,
        inventory: 80,
      },
    ],
  },
];

async function seed() {
  const allowDestructive =
    process.env.ALLOW_DESTRUCTIVE_SEED === "true" ||
    process.env.NODE_ENV !== "production";

  if (!allowDestructive) {
    console.error(
      "Refusing to seed: destructive wipe is blocked in production. Set ALLOW_DESTRUCTIVE_SEED=true to override.",
    );
    process.exit(1);
  }

  console.log("Seeding database...");

  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.productCategories);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  await db.insert(schema.categories).values([...CATEGORIES]);

  for (const product of PRODUCTS) {
    const productId = nanoid();
    await db.insert(schema.products).values({
      id: productId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      featured: product.featured,
      active: true,
    });

    await db.insert(schema.productVariants).values(
      product.variants.map((v) => ({
        id: nanoid(),
        productId,
        name: v.name,
        sku: v.sku,
        priceCents: v.priceCents,
        compareAtCents: v.compareAtCents,
        inventory: v.inventory,
      })),
    );

    await db.insert(schema.productCategories).values(
      product.categoryIds.map((categoryId) => ({
        productId,
        categoryId,
      })),
    );
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`,
  );
  await client.end();
}

seed().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
