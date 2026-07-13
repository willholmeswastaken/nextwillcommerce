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

  test("lister to PDP resets scroll to top", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

    // Scroll deep into the listing so a soft navigation would otherwise keep Y.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(100);

    await page.getByRole("link", { name: /Merino Beanie/i }).first().click();
    await expect(page.locator('[data-testid="product-shell"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Merino Beanie" })).toBeVisible();

    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeLessThan(8);
  });

  test("add to cart and mock checkout", async ({ page }) => {
    await page.goto("/products/aero-runner");
    await page.getByRole("button", { name: "Add to cart" }).click();

    const cartDrawer = page.getByRole("dialog", { name: "Your cart" });
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText("Aero Runner")).toBeVisible();
    await expect(page.getByText(/added to cart/i)).toBeAttached();

    await cartDrawer.getByRole("link", { name: "Checkout" }).click();
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByText("Aero Runner")).toBeVisible();

    await page.getByLabel("Email for receipt").fill("buyer@example.com");
    await page.getByRole("button", { name: /Complete mock checkout/i }).click();

    await expect(page.getByRole("heading", { name: /Thanks for your purchase/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { name: "Your items" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Aero Runner/i }).first()).toBeVisible();
  });
});
