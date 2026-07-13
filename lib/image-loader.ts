"use client";

/**
 * Serve remote product images directly from the origin CDN (Unsplash)
 * with responsive width/quality. This skips the Next.js `/_next/image`
 * proxy fetch+encode hop, which is the main delay for remote catalog images.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  try {
    const url = new URL(src);

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "max");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality ?? 75));
      return url.href;
    }

    return src;
  } catch {
    // Relative / local paths — serve as-is under the custom loader.
    return src;
  }
}
