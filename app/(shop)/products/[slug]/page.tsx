import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/(shop)/catalog";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductImage } from "@/components/product-image";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_DETAIL_SIZES } from "@/lib/product-image";

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
    <div data-testid="product-shell" className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-accent-soft/30">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          fill
          preload
          sizes={PRODUCT_DETAIL_SIZES}
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex flex-wrap gap-2">
          {product.categories.map((cat) => (
            <Badge key={cat.id}>{cat.name}</Badge>
          ))}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {product.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {product.description}
        </p>
        <div className="mt-8">
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* params must sit in Suspense for Cache Components; catalog data is cached. */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
