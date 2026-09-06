import { expect, test } from "@playwright/test";

test.describe("storefront", () => {
  test("home page renders featured products", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /gear that earns the last mile/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "The night drop" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Aero Runner/i }).first()).toBeVisible();
  });

  test("product listing and detail navigation", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

    await page.getByRole("link", { name: /Aero Runner/i }).first().click();
    await expect(page.locator('[data-testid="product-shell"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aero Runner" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "You may also like" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Trail Peak Boot/i }).first()).toBeVisible();
  });

  test("lister filters, sorts, paginates, and quick-adds", async ({ page }) => {
    await page.goto("/products");

    await page
      .getByRole("navigation", { name: "Filters" })
      .getByRole("link", { name: "Footwear" })
      .click();
    await expect(page).toHaveURL(/category=footwear/);
    await expect(page.getByRole("link", { name: /Aero Runner/i }).first()).toBeVisible();

    await page.getByRole("link", { name: "Clear all filters" }).click();
    await expect(page).toHaveURL(/\/products$/);

    await page.getByLabel("Sort products").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(
      page.getByRole("link", { name: /Pulse Compression Socks/i }).first(),
    ).toBeVisible();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole("link", { name: /Trail Peak Boot/i }).first()).toBeVisible();

    await page.goto("/products");
    const pulseCard = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: "Pulse Compression Socks" }),
    });
    await pulseCard.evaluate((node) =>
      node.scrollIntoView({ block: "center", inline: "nearest" }),
    );
    await pulseCard
      .getByRole("button", { name: /quick add pulse compression socks/i })
      .click();
    const cartDrawer = page.getByRole("dialog", { name: "Your cart" });
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText("Pulse Compression Socks")).toBeVisible();
    await cartDrawer.getByRole("button", { name: "Close cart panel" }).click();

    const aeroCard = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: "Aero Runner" }),
    });
    await aeroCard.evaluate((node) =>
      node.scrollIntoView({ block: "center", inline: "nearest" }),
    );
    await aeroCard.getByRole("button", { name: /quick add aero runner/i }).click();
    await aeroCard.getByRole("button", { name: "US 8" }).click();
    await expect(page.getByRole("dialog", { name: "Your cart" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Your cart" }).getByText("Aero Runner"),
    ).toBeVisible();
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
    await expect(
      page.getByRole("listitem").filter({ hasText: /Aero Runner/ }),
    ).toBeVisible();

    await page.getByLabel("Email for receipt").fill("buyer@example.com");
    await page.getByRole("button", { name: /Complete mock checkout/i }).click();

    await expect(page.getByRole("heading", { name: /Thanks for your purchase/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { name: "Your items" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Aero Runner/i }).first()).toBeVisible();
  });
});
