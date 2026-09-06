import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductSlugs,
  getRelatedProducts,
} from "@/app/(shop)/catalog";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import type { ProductWithVariants } from "@/app/server/features/product/product.repository";
import {
  PRODUCT_DETAIL_SIZES,
  PRODUCT_IMAGE_FRAME_CLASSNAME,
} from "@/lib/product-image";

export const prefetch = "allow-runtime";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  // Cache Components requires at least one sample so the route can prerender.
  if (slugs.length === 0) {
    return [{ slug: "aero-runner" }];
  }
  return slugs.map((slug) => ({ slug }));
}

async function productMetadata(slug: string): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${slug}`);
  try {
    const product = await getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: "Product" };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata(slug);
}

function ProductView({ product }: { product: ProductWithVariants }) {
  return (
    <div
      data-testid="product-shell"
      className="grid gap-6 lg:grid-cols-2 lg:gap-10"
    >
      <div
        className={`relative -mx-4 h-[38svh] w-[calc(100%+2rem)] overflow-hidden sm:mx-0 sm:h-auto sm:w-full sm:aspect-[4/5] sm:rounded-2xl sm:border sm:border-border ${PRODUCT_IMAGE_FRAME_CLASSNAME}`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          fill
          preload
          sizes={PRODUCT_DETAIL_SIZES}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center px-0">
        <div className="flex flex-wrap gap-2">
          {product.categories.map((cat) => (
            <Badge key={cat.id}>{cat.name}</Badge>
          ))}
        </div>
        <h1 className="font-display mt-3 text-3xl tracking-tight sm:mt-4 sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-5 sm:mt-8">
          <AddToCartForm
            variants={product.variants}
            productName={product.name}
          />
        </div>
        <p className="mt-6 text-base leading-relaxed text-muted">
          {product.description}
        </p>
      </div>
    </div>
  );
}

async function RelatedProducts({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug?: string;
}) {
  const related = await getRelatedProducts(slug, categorySlug);
  if (related.length === 0) return null;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="font-display text-3xl tracking-tight">You may also like</h2>
      <p className="mt-1 text-sm text-muted">
        Quick-add from here, or open a piece for the full kit notes.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

async function ProductDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <nav className="mb-3 text-sm text-muted sm:mb-6">
        <Link href="/products" prefetch className="hover:text-foreground">
          Shop
        </Link>
        <span aria-hidden className="px-2">
          /
        </span>
        <span className="text-foreground">{product.name}</span>
      </nav>
      <ProductView product={product} />
      <Suspense fallback={null}>
        <RelatedProducts
          slug={product.slug}
          categorySlug={product.categories[0]?.slug}
        />
      </Suspense>
    </>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-10">
      {/* params must sit in Suspense for Cache Components; catalog data is cached. */}
      <Suspense
        fallback={
          <>
            <nav className="mb-3 text-sm text-muted sm:mb-6">
              <Link href="/products" prefetch className="hover:text-foreground">
                Shop
              </Link>
              <span aria-hidden className="px-2">
                /
              </span>
              <span>Product</span>
            </nav>
            <ProductDetailSkeleton />
          </>
        }
      >
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
