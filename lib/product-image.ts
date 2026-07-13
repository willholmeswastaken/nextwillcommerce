/** Catalog card / grid: mobile full-bleed, tablet half, desktop third. */
export const PRODUCT_CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/** Product detail hero: full width until lg split layout. */
export const PRODUCT_DETAIL_SIZES =
  "(max-width: 1024px) 100vw, 50vw";

/**
 * Warm paper tone for the image frame while the photo loads.
 * Matches the storefront background better than accent mint / flat blur slabs.
 */
export const PRODUCT_IMAGE_FRAME_CLASSNAME =
  "bg-[linear-gradient(160deg,#efeae2_0%,#e7e0d4_55%,#ddd4c6_100%)]";
