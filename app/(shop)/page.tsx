import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedProducts, getProducts } from "@/app/(shop)/catalog";
import { ProductCard } from "@/components/product-card";
import { PromoBanner } from "@/components/promo-banner";
import { ContentBanner } from "@/components/content-banner";
import { isOnSale } from "@/lib/catalog-query";

const CATEGORY_ART: Record<string, string> = {
  footwear: "/products/trail-peak-boot.jpg",
  apparel: "/products/lumen-windbreaker.jpg",
  accessories: "/products/daypack-20l.jpg",
};

export default async function HomePage() {
  const [featured, categories, products] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getProducts(),
  ]);
  const sale = products.filter(isOnSale).slice(0, 3);

  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden bg-pine text-pine-foreground">
        <Image
          src="/products/aero-runner.jpg"
          alt=""
          fill
          preload
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pine via-pine/80 to-transparent" />
        <div className="relative mx-auto grid min-h-[78svh] max-w-7xl items-end px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
          <div className="animate-reveal">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-accent">
              Night drop 06 · After-hours kit
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[0.92] tracking-tight sm:text-7xl">
              Gear that earns the last mile.
            </h1>
            <p className="mt-6 max-w-xl text-base text-pine-foreground/75 sm:text-lg">
              Performance footwear, quiet apparel, and carry pieces for the
              people still outside when the streets go sodium-orange.
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
                className="inline-flex h-12 items-center rounded-full border border-pine-foreground/25 bg-pine-foreground/10 px-6 text-sm font-medium"
              >
                View Aero Runner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              prefetch
              className="group relative isolate min-h-52 overflow-hidden rounded-[1.7rem] bg-pine text-pine-foreground"
            >
              <Image
                src={CATEGORY_ART[category.slug] ?? "/products/cloud-soft-tee.jpg"}
                alt=""
                fill
                className="object-cover opacity-45 transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/20 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">
                  Shop
                </p>
                <h2 className="font-display text-3xl tracking-tight">
                  {category.name}
                </h2>
              </div>
            </Link>
          ))}
        </section>

        <PromoBanner
          variant="ember"
          eyebrow="Limited window"
          title="Aero Runner — $20 off the night pair."
          description="Responsive foam, breathable knit, city-to-tempo. While this drop lasts."
          cta="Shop the sale"
          href="/products?sale=1"
          imageSrc="/products/aero-runner.jpg"
          imageAlt="Aero Runner"
        />

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-accent">
                Featured
              </p>
              <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
                The night drop
              </h2>
            </div>
            <Link
              href="/products"
              prefetch
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                preload={index < 3}
                featured={index === 0}
                className={index === 0 ? "sm:col-span-2 lg:col-span-1" : undefined}
              />
            ))}
          </div>
        </section>

        <ContentBanner
          eyebrow="Apparel notes"
          title="Cut for motion, not the locker-room mirror."
          body="Organic cotton, recycled fleece, and packable shells that stay quiet on a 5 a.m. loop. No logos yelling. Just kit that moves."
          cta="Shop apparel"
          href="/products?category=apparel"
          imageSrc="/products/cloud-soft-tee.jpg"
          imageAlt="Cloud Soft Tee"
        />

        {sale.length > 0 ? (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-accent">
                  On sale
                </p>
                <h2 className="font-display mt-2 text-3xl tracking-tight">
                  Marked down, still earning miles.
                </h2>
              </div>
              <Link
                href="/products?sale=1"
                prefetch
                className="text-sm text-accent underline-offset-4 hover:underline"
              >
                All sale
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sale.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <ContentBanner
          reverse
          eyebrow="Carry"
          title="The commute still counts as training."
          body="Weather-resistant shells, hidden bottle pockets, and a laptop sleeve that doesn’t announce itself. Daypack 20L is built for the hours between sessions."
          cta="Shop accessories"
          href="/products?category=accessories"
          imageSrc="/products/daypack-20l.jpg"
          imageAlt="Daypack 20L"
        />

        <PromoBanner
          variant="ink"
          eyebrow="Members"
          title="First kit ships free. Nightfall takes 15%."
          description="Join for early drops, repairs guidance, and the 5 a.m. club notes."
          cta="Browse the full catalog"
          href="/products"
        />
      </div>
    </div>
  );
}
