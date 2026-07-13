"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveProductImageSrc } from "@/lib/product-image";

type ProductImageProps = Omit<
  ImageProps,
  "alt" | "placeholder" | "blurDataURL" | "quality" | "onLoad"
> & {
  alt: string;
  /** Lower for thumbnails; default 75 matches Next.js 16 qualities allowlist. */
  quality?: number;
};

/**
 * Storefront product photo from /public, optimized by next/image on Vercel.
 * A warm pulse sits behind the photo and is removed once it loads —
 * animating the frame parent would keep fading the loaded image forever.
 */
export function ProductImage({
  alt,
  quality = 75,
  className,
  preload = false,
  src,
  ...props
}: ProductImageProps) {
  const resolvedSrc =
    typeof src === "string" ? resolveProductImageSrc(src) : src;
  // Track which src finished loading so soft navigations that reuse this
  // instance (e.g. PDP → PDP) reset the pulse instead of keeping loaded=true.
  const [loadedSrc, setLoadedSrc] = useState<typeof resolvedSrc | null>(null);
  const loaded = loadedSrc === resolvedSrc;
  const markLoaded = () => setLoadedSrc(resolvedSrc);

  return (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 product-image-frame-pulse",
          loaded && "hidden",
        )}
      />
      <Image
        key={typeof resolvedSrc === "string" ? resolvedSrc : undefined}
        {...props}
        src={resolvedSrc}
        alt={alt}
        quality={quality}
        preload={preload}
        placeholder="empty"
        onLoad={markLoaded}
        ref={(node) => {
          if (node?.complete) markLoaded();
        }}
        className={cn(
          "z-[1]",
          !preload && "transition-opacity duration-500 ease-out",
          !preload && !loaded && "opacity-0",
          className,
        )}
      />
    </>
  );
}
