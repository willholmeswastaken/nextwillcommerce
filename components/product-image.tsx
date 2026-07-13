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
  const [loaded, setLoaded] = useState(false);

  const markLoaded = () => setLoaded(true);
  const resolvedSrc =
    typeof src === "string" ? resolveProductImageSrc(src) : src;

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
