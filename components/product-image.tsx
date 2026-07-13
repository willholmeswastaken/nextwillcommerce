"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = Omit<
  ImageProps,
  "alt" | "placeholder" | "blurDataURL" | "quality" | "onLoad"
> & {
  alt: string;
  /** Lower for thumbnails; default 75 matches Next.js 16 qualities allowlist. */
  quality?: number;
};

/**
 * Storefront product photo with CDN-sized srcset.
 * Sits on the warm frame behind it (no muddy SVG blur) and fades in when ready.
 * Preloaded LCP images skip the fade so they paint immediately.
 */
export function ProductImage({
  alt,
  quality = 75,
  className,
  preload = false,
  ...props
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      quality={quality}
      preload={preload}
      placeholder="empty"
      onLoad={() => setLoaded(true)}
      className={cn(
        !preload && "transition-opacity duration-500 ease-out",
        !preload && !loaded && "opacity-0",
        className,
      )}
    />
  );
}
