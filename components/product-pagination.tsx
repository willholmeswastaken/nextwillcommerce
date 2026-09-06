import Link from "next/link";
import { cn } from "@/lib/utils";
import { productsHref, type CatalogQuery } from "@/lib/catalog-query";

function pageList(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function ProductPagination({
  query,
  page,
  totalPages,
}: {
  query: CatalogQuery;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = pageList(page, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <Link
        href={productsHref({ ...query, page: Math.max(1, page - 1) })}
        prefetch
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex h-10 items-center rounded-full border border-border px-4 text-sm",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        Previous
      </Link>
      {pages.map((value, index) => {
        const prev = pages[index - 1];
        return (
          <span key={value} className="contents">
            {prev && value - prev > 1 ? (
              <span className="px-1 text-muted" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={productsHref({ ...query, page: value })}
              prefetch
              aria-current={value === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm",
                value === page
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card hover:bg-accent-soft",
              )}
            >
              {value}
            </Link>
          </span>
        );
      })}
      <Link
        href={productsHref({ ...query, page: Math.min(totalPages, page + 1) })}
        prefetch
        aria-disabled={page >= totalPages}
        className={cn(
          "inline-flex h-10 items-center rounded-full border border-border px-4 text-sm",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        Next
      </Link>
    </nav>
  );
}
