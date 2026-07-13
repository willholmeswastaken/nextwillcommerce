import Image, { type ImageProps } from "next/image";
import {
  PRODUCT_IMAGE_BLUR_DATA_URL,
} from "@/lib/product-image";

type ProductImageProps = Omit<
  ImageProps,
  "alt" | "placeholder" | "blurDataURL" | "quality"
> & {
  alt: string;
  /** Lower for thumbnails; default 75 matches Next.js 16 qualities allowlist. */
  quality?: number;
};

/**
 * Storefront product photo with blur-up placeholder and CDN-sized srcset.
 * Relies on `images.loaderFile` for Unsplash CDN delivery.
 */
export function ProductImage({
  alt,
  quality = 75,
  className,
  ...props
}: ProductImageProps) {
  return (
    <Image
      alt={alt}
      quality={quality}
      placeholder="blur"
      blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
      className={className}
      {...props}
    />
  );
}
