/** Catalog card / grid: mobile full-bleed, tablet half, desktop third. */
export const PRODUCT_CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/** Product detail hero: full width until lg split layout. */
export const PRODUCT_DETAIL_SIZES =
  "(max-width: 1024px) 100vw, 50vw";

/**
 * Static warm paper tone for the image frame (no animation).
 * The pulse lives on a sibling underlay inside ProductImage and stops on load.
 */
export const PRODUCT_IMAGE_FRAME_CLASSNAME =
  "bg-[color-mix(in_srgb,var(--border)_55%,var(--card))]";

/**
 * Legacy Unsplash seed URLs → local /public/products paths.
 * Lets existing DBs keep working without a destructive reseed.
 */
const LEGACY_UNSPLASH_TO_LOCAL: Record<string, string> = {
  "1542291026-7eec264c27ff": "/products/aero-runner.jpg",
  "1520639888713-7851133b1ed0": "/products/trail-peak-boot.jpg",
  "1521572163474-6864f9cf17ab": "/products/cloud-soft-tee.jpg",
  "1556821840-3a63f95609a7": "/products/summit-fleece.jpg",
  "1591195853828-11db59a44f6b": "/products/velocity-shorts.jpg",
  "1553062407-98eeb64c6a62": "/products/daypack-20l.jpg",
  "1602143407151-7111542de6e8": "/products/insulated-bottle-750.jpg",
  "1576871337622-98d48d1cf531": "/products/merino-beanie.jpg",
  "1588850561407-ed78c282e89b": "/products/studio-cap.jpg",
  "1591047139829-d91aecb6caea": "/products/lumen-windbreaker.jpg",
  "1517836357463-d25dfeac3438": "/products/grip-training-gloves.jpg",
  "1586350977771-b3b0abd50c82": "/products/pulse-compression-socks.jpg",
};

/** Normalize product image src to a local public path when possible. */
export function resolveProductImageSrc(src: string): string {
  if (src.startsWith("/products/")) {
    return src;
  }

  const match = src.match(/photo-([a-z0-9-]+)/i);
  if (match) {
    const local = LEGACY_UNSPLASH_TO_LOCAL[match[1]!];
    if (local) return local;
  }

  return src;
}
