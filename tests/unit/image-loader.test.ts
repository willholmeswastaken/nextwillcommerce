import { describe, expect, it } from "vitest";
import imageLoader from "@/lib/image-loader";

describe("imageLoader", () => {
  it("rewrites Unsplash URLs with responsive width, quality, and auto format", () => {
    const href = imageLoader({
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      width: 640,
      quality: 75,
    });

    const url = new URL(href);
    expect(url.hostname).toBe("images.unsplash.com");
    expect(url.searchParams.get("auto")).toBe("format");
    expect(url.searchParams.get("fit")).toBe("max");
    expect(url.searchParams.get("w")).toBe("640");
    expect(url.searchParams.get("q")).toBe("75");
  });

  it("leaves non-Unsplash absolute URLs unchanged", () => {
    const src = "https://cdn.example.com/shoe.jpg";
    expect(imageLoader({ src, width: 400 })).toBe(src);
  });

  it("leaves relative paths unchanged", () => {
    expect(imageLoader({ src: "/products/shoe.jpg", width: 400 })).toBe(
      "/products/shoe.jpg",
    );
  });
});
