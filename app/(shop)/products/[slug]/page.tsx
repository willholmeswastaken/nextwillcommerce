import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/(shop)/catalog";
import { AddToCartForm } from "@/components/add-to-cart-form";
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
    <div data-testid="product-shell" className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-accent-soft/30">
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

function ProductFallback() {
  return (
    <div data-testid="product-shell" className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-border/60" />
      <div className="space-y-4 py-8">
        <div className="h-6 w-24 animate-pulse rounded bg-border/60" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-border/60" />
        <div className="h-24 w-full animate-pulse rounded bg-border/50" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-border/60" />
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
      {/*
        Instant Navigations: Stream strategy.
        Params are awaited in a Suspense child so the route shell stays instant.
      */}
      <Suspense fallback={<ProductFallback />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
