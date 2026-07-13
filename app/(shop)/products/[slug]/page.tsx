import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/(shop)/catalog";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductImage } from "@/components/product-image";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_DETAIL_SIZES,
  PRODUCT_IMAGE_FRAME_CLASSNAME,
} from "@/lib/product-image";

export const prefetch = "allow-runtime";

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
    <div
      data-testid="product-shell"
      className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:px-0"
    >
      {/* Full-bleed square hero on mobile; taller framed split-pane on lg+ */}
      <div
        className={`relative aspect-square max-h-[70svh] overflow-hidden sm:mx-6 sm:rounded-[2rem] sm:border sm:border-border lg:mx-0 lg:aspect-[4/5] lg:max-h-none ${PRODUCT_IMAGE_FRAME_CLASSNAME}`}
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
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-0">
        <div className="flex flex-wrap gap-2">
          {product.categories.map((cat) => (
            <Badge key={cat.id}>{cat.name}</Badge>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:mt-4">
          {product.description}
        </p>
        <div className="mt-6 sm:mt-8">
          <AddToCartForm
            variants={product.variants}
            productName={product.name}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="mx-auto max-w-6xl px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-0 sm:px-0 sm:pb-10 sm:pt-6 lg:px-6 lg:py-10">
      {/* params must sit in Suspense for Cache Components; catalog data is cached. */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
