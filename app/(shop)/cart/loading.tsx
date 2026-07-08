import { CartSkeleton } from "@/components/skeletons";

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-9 w-32 animate-pulse rounded bg-border/60" />
      <CartSkeleton />
    </div>
  );
}
