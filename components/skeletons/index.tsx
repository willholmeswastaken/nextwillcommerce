export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="aspect-[4/5] animate-pulse bg-border/60" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-border/60" />
        <div className="h-4 w-full animate-pulse rounded bg-border/50" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-border/40" />
      </div>
    </div>
  );
}

const PILL_WIDTHS = ["w-12", "w-20", "w-16", "w-24", "w-20"] as const;

export function CategoryPillsSkeleton({
  count = PILL_WIDTHS.length,
}: {
  count?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-9 animate-pulse rounded-full border border-border bg-border/50 ${PILL_WIDTHS[i % PILL_WIDTHS.length]}`}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches /products content: category pills + product grid. */
export function ProductsListingSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <>
      <CategoryPillsSkeleton />
      <div className="mt-8">
        <ProductGridSkeleton count={count} />
      </div>
    </>
  );
}

/** Matches /products/[slug]: full-bleed image + badges, title, copy, variant pills, CTA. */
export function ProductDetailSkeleton() {
  return (
    <div
      data-testid="product-shell"
      className="grid gap-6 lg:grid-cols-2 lg:gap-10"
    >
      <div className="aspect-[4/5] animate-pulse bg-border/60 sm:mx-6 sm:rounded-[2rem] sm:border sm:border-border lg:mx-0" />
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-0">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-border/60" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-border/50" />
        </div>
        <div className="mt-3 h-9 w-3/4 max-w-md animate-pulse rounded bg-border/60 sm:mt-4 sm:h-10" />
        <div className="mt-3 space-y-2 sm:mt-4">
          <div className="h-4 w-full animate-pulse rounded bg-border/50" />
          <div className="h-4 w-full animate-pulse rounded bg-border/45" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-border/40" />
        </div>
        <div className="mt-6 space-y-5 sm:mt-8">
          <div>
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-border/50" />
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-16 animate-pulse rounded-full border border-border bg-border/50" />
              <div className="h-9 w-14 animate-pulse rounded-full border border-border bg-border/45" />
              <div className="h-9 w-20 animate-pulse rounded-full border border-border bg-border/40" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="h-9 w-28 animate-pulse rounded bg-border/60" />
              <div className="h-4 w-20 animate-pulse rounded bg-border/40" />
            </div>
            <div className="hidden h-12 w-36 animate-pulse rounded-full bg-border/60 sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <div className="h-24 w-24 animate-pulse rounded-xl bg-border/60" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-1/2 animate-pulse rounded bg-border/60" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-border/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Matches /checkout: items column + payment column. */
export function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="h-6 w-16 animate-pulse rounded bg-border/60" />
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3"
            >
              <div className="h-4 w-2/3 animate-pulse rounded bg-border/50" />
              <div className="h-4 w-14 animate-pulse rounded bg-border/40" />
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 h-6 w-20 animate-pulse rounded bg-border/60" />
        <div className="space-y-4">
          <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-border/45" />
          <div className="h-12 w-full animate-pulse rounded-full bg-border/60" />
        </div>
      </div>
    </div>
  );
}
