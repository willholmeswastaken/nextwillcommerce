import { describe, expect, it } from "vitest";
import { toAbsoluteUrl } from "@/lib/utils";

describe("toAbsoluteUrl", () => {
  it("leaves absolute http(s) URLs unchanged", () => {
    expect(toAbsoluteUrl("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
  });

  it("resolves site-relative paths against the app base URL", () => {
    expect(
      toAbsoluteUrl("/products/aero-runner.jpg", "http://localhost:3000"),
    ).toBe("http://localhost:3000/products/aero-runner.jpg");
  });
});
