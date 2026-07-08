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

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
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
