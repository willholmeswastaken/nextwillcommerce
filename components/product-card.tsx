import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import type { ProductWithVariants } from "@/app/server/features/product/product.repository";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CARD_SIZES } from "@/lib/product-image";

export function ProductCard({
  product,
  preload = false,
}: {
  product: ProductWithVariants;
  /** Preload above-the-fold images (Next.js 16: replaces deprecated `priority`). */
  preload?: boolean;
}) {
  const lowest = product.variants.reduce(
    (min, v) => Math.min(min, v.priceCents),
    product.variants[0]?.priceCents ?? 0,
  );
  const compare = product.variants.find((v) => v.compareAtCents)?.compareAtCents;

  return (
    <Link
      href={`/products/${product.slug}`}
      prefetch
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_40px_-28px_rgba(20,17,15,0.45)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_-28px_rgba(15,118,110,0.45)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft/40">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes={PRODUCT_CARD_SIZES}
          preload={preload}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.featured ? (
          <div className="absolute left-3 top-3">
            <Badge>Featured</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
          <div className="text-right">
            <p className="font-medium">{formatMoney(lowest)}</p>
            {compare ? (
              <p className="text-xs text-muted line-through">
                {formatMoney(compare)}
              </p>
            ) : null}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {product.categories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
