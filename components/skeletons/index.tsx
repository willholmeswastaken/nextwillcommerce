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

/** Matches /products content: promo + filters + toolbar + product grid. */
export function ProductsListingSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <>
      <div className="mb-10 h-40 animate-pulse rounded-[1.75rem] bg-border/50" />
      <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr]">
        <div className="hidden space-y-3 lg:block">
          <CategoryPillsSkeleton count={4} />
        </div>
        <div>
          <div className="mb-6 h-10 w-48 animate-pulse rounded-full bg-border/40" />
          <ProductGridSkeleton count={count} />
        </div>
      </div>
    </>
  );
}

/** Matches /products/[slug]: image + badges, title, copy, variant pills, CTA. */
export function ProductDetailSkeleton() {
  return (
    <div data-testid="product-shell" className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div
        data-testid="product-hero"
        className="relative left-1/2 h-[min(48svh,100vw)] w-screen max-w-[100vw] -translate-x-1/2 animate-pulse bg-border/60 sm:left-auto sm:h-auto sm:w-full sm:max-w-none sm:translate-x-0 sm:aspect-[4/5] sm:rounded-2xl sm:border sm:border-border"
      />
      <div className="flex flex-col justify-center">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-border/60" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-border/50" />
        </div>
        <div className="mt-3 h-9 w-3/4 max-w-md animate-pulse rounded bg-border/60 sm:mt-4 sm:h-10" />
        <div className="mt-5 space-y-5 sm:mt-8">
          <div>
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-border/50" />
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-16 animate-pulse rounded-full border border-border bg-border/50" />
              <div className="h-9 w-14 animate-pulse rounded-full border border-border bg-border/45" />
              <div className="h-9 w-20 animate-pulse rounded-full border border-border bg-border/40" />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="h-9 w-28 animate-pulse rounded bg-border/60" />
              <div className="h-4 w-20 animate-pulse rounded bg-border/40" />
            </div>
            <div className="h-12 w-full rounded-full bg-border/60 sm:w-36" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-border/50" />
          <div className="h-4 w-full animate-pulse rounded bg-border/45" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-border/40" />
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
