import { expect, test } from "@playwright/test";

test.describe("storefront", () => {
  test("home page renders featured products", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /ecommerce template that feels as fast/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured products" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Aero Runner/i }).first()).toBeVisible();
  });

  test("product listing and detail navigation", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

    await page.getByRole("link", { name: /Aero Runner/i }).first().click();
    await expect(page.locator('[data-testid="product-shell"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aero Runner" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
  });

  test("add to cart and mock checkout", async ({ page }) => {
    await page.goto("/products/aero-runner");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText(/added to cart/i)).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();
    await expect(page.getByText("Aero Runner")).toBeVisible();

    await page.getByRole("link", { name: "Checkout" }).click();
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    await page.getByLabel("Email for receipt").fill("buyer@example.com");
    await page.getByRole("button", { name: /Complete mock checkout/i }).click();

    await expect(page.getByText(/Thanks for your purchase/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
