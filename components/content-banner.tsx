import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ContentBannerProps = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
};

export function ContentBanner({
  eyebrow,
  title,
  body,
  cta,
  href,
  imageSrc,
  imageAlt,
  reverse = false,
}: ContentBannerProps) {
  return (
    <section
      className={cn(
        "grid overflow-hidden rounded-[2rem] border border-border bg-card lg:grid-cols-2",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
    >
      <div className="relative min-h-64 lg:min-h-[28rem]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 38rem"
        />
      </div>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </p>
        <h2 className="font-display mt-3 text-3xl leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          {body}
        </p>
        <Link
          href={href}
          prefetch
          className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-accent hover:text-accent-foreground"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
