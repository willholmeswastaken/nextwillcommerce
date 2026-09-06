import Link from "next/link";
import type { ProductWithVariants } from "@/app/server/features/product/product.repository";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { QuickAdd } from "@/components/quick-add";
import {
  compareAtCents,
  isOnSale,
  lowestPriceCents,
} from "@/lib/catalog-query";
import {
  PRODUCT_CARD_SIZES,
  PRODUCT_IMAGE_FRAME_CLASSNAME,
} from "@/lib/product-image";
import { cn, formatMoney } from "@/lib/utils";

export function ProductCard({
  product,
  preload = false,
  featured = false,
  className,
}: {
  product: ProductWithVariants;
  preload?: boolean;
  featured?: boolean;
  className?: string;
}) {
  const lowest = lowestPriceCents(product);
  const compare = compareAtCents(product);
  const sale = isOnSale(product);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[0_18px_40px_-32px_rgba(22,18,14,0.55)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_-28px_rgba(201,75,22,0.35)]",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        prefetch
        className={cn(
          "relative overflow-hidden",
          featured ? "aspect-[4/3] sm:aspect-[5/4]" : "aspect-[4/5]",
          PRODUCT_IMAGE_FRAME_CLASSNAME,
        )}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes={PRODUCT_CARD_SIZES}
          preload={preload}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 z-[2] flex flex-wrap gap-1.5">
          {product.featured ? <Badge>Drop</Badge> : null}
          {sale ? (
            <Badge className="bg-accent text-accent-foreground">Sale</Badge>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {product.categories.map((cat) => cat.name).join(" · ") || "Kit"}
            </p>
            <h3 className="font-display mt-1 text-xl leading-tight tracking-tight">
              <Link
                href={`/products/${product.slug}`}
                prefetch
                className="hover:text-accent"
              >
                {product.name}
              </Link>
            </h3>
          </div>
          <div className="text-right">
            <p className="font-medium tabular-nums">{formatMoney(lowest)}</p>
            {compare ? (
              <p className="text-xs text-muted line-through tabular-nums">
                {formatMoney(compare)}
              </p>
            ) : null}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="mt-auto pt-1">
          <QuickAdd productName={product.name} variants={product.variants} />
        </div>
      </div>
    </article>
  );
}
