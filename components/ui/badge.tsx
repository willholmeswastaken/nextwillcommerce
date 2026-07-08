import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
