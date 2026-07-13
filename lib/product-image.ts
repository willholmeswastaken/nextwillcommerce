/**
 * Shared defaults for product photography across the storefront.
 * Tiny SVG placeholder paints instantly while the real image loads.
 */
export const PRODUCT_IMAGE_BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20">
      <rect width="100%" height="100%" fill="#e6dfd4"/>
    </svg>`,
  );

/** Catalog card / grid: mobile full-bleed, tablet half, desktop third. */
export const PRODUCT_CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/** Product detail hero: full width until lg split layout. */
export const PRODUCT_DETAIL_SIZES =
  "(max-width: 1024px) 100vw, 50vw";
