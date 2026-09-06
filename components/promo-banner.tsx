import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PromoBannerProps = {
  eyebrow: string;
  title: string;
  description?: string;
  cta: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  variant?: "inverse" | "paper";
  className?: string;
};

const variants = {
  inverse: "bg-inverse text-inverse-foreground",
  paper: "border border-border bg-card text-foreground",
};

export function PromoBanner({
  eyebrow,
  title,
  description,
  cta,
  href,
  imageSrc,
  imageAlt,
  variant = "inverse",
  className,
}: PromoBannerProps) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group relative isolate flex min-h-40 overflow-hidden rounded-2xl px-6 py-7 sm:min-h-44 sm:px-8",
        variants[variant],
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          className="absolute inset-0 -z-10 object-cover opacity-25 transition duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 76rem"
        />
      ) : null}
      <div className="relative z-[1] flex max-w-xl flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] opacity-60">
          {eyebrow}
        </p>
        <h2 className="font-display mt-2 text-3xl leading-none tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-md text-sm opacity-70">{description}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">
          {cta}
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
