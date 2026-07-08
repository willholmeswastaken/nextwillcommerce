export default function ProductLoading() {
  return (
    <div
      data-testid="product-shell"
      className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2"
    >
      <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-border/60" />
      <div className="space-y-4 py-8">
        <div className="h-6 w-24 animate-pulse rounded bg-border/60" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-border/60" />
        <div className="h-24 w-full animate-pulse rounded bg-border/50" />
      </div>
    </div>
  );
}
