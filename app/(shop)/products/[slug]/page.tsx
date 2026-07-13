import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/(shop)/catalog";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";

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
    <div data-testid="product-shell" className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="relative aspect-[4/3] max-h-[36svh] overflow-hidden rounded-[1.5rem] border border-border bg-accent-soft/30 sm:rounded-[2rem] lg:aspect-[4/5] lg:max-h-none">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {/* params must sit in Suspense for Cache Components; catalog data is cached. */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
