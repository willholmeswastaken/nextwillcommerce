import { describe, expect, it } from "vitest";
import { resolveProductImageSrc } from "@/lib/product-image";

describe("resolveProductImageSrc", () => {
  it("leaves local /products paths unchanged", () => {
    expect(resolveProductImageSrc("/products/aero-runner.jpg")).toBe(
      "/products/aero-runner.jpg",
    );
  });

  it("maps legacy Unsplash seed URLs to local assets", () => {
    expect(
      resolveProductImageSrc(
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      ),
    ).toBe("/products/aero-runner.jpg");
  });

  it("passes through unknown remote URLs", () => {
    expect(
      resolveProductImageSrc("https://cdn.example.com/custom.jpg"),
    ).toBe("https://cdn.example.com/custom.jpg");
  });
});
