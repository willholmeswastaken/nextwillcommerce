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
