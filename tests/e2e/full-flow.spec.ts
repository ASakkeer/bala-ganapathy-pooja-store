import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { SESSION_COOKIE, signSession } from "../../src/lib/session";

const PHONE = "9876543210";

async function signIn(context: BrowserContext) {
  const token = await signSession({
    userId: `user-${PHONE}`,
    phone: PHONE,
    role: "customer",
  });
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      url: "http://localhost:3000",
      httpOnly: true,
    },
  ]);
}

async function fillDemoAddress(page: Page) {
  await expect(page.getByRole("heading", { name: "Add an address" })).toBeVisible();
  await page.getByLabel("Name").fill("Test Buyer");
  await page.getByLabel("Address line 1").fill("1 Demo Street");
  await page.getByLabel("City").fill("Delhi");
  await page.getByLabel("State").fill("Delhi");
  await page.getByLabel("Pincode").fill("110001");
  await expect(page.getByRole("button", { name: "Save address" })).toBeEnabled();
  await page.getByRole("button", { name: "Save address" }).click();
}

async function expectPageOk(page: Page, path: string, heading: RegExp) {
  const response = await page.goto(path);
  expect(response?.ok(), `${path} returned ${response?.status()}`).toBeTruthy();
  await expect(page.locator("body")).not.toContainText("Application error");
  await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
}

test("guest screens load without errors", async ({ page }) => {
  await expectPageOk(page, "/", /Traditional pooja/i);
  await expectPageOk(page, "/shop", /All products/i);
  await expectPageOk(page, "/c/pooja-essentials", /Pooja Essentials/i);
  await expectPageOk(page, "/c/ganapathy-homam", /Ganapathy Homam/i);
  await expectPageOk(page, "/p/karpooram-camphor", /Camphor/i);
  await expectPageOk(page, "/search?q=camphor", /camphor/i);
  await expectPageOk(page, "/search?q=%E0%AE%95%E0%AE%B1%E0%AF%8D%E0%AE%AA%E0%AF%82%E0%AE%B0%E0%AE%AE%E0%AF%8D", /Camphor|கற்பூரம்/i);
  await expectPageOk(page, "/about", /About/i);
  await expectPageOk(page, "/contact", /Contact/i);
  await expectPageOk(page, "/track", /Track order/i);
  await expectPageOk(page, "/policies/shipping", /Shipping/i);
  await expectPageOk(page, "/policies/returns", /Returns/i);
  await expectPageOk(page, "/policies/privacy", /Privacy/i);
  await expectPageOk(page, "/policies/terms", /Terms/i);
  await expectPageOk(page, "/login", /Continue with your phone|Sign in/i);
});

test("home merchandising works on mobile and desktop", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const response = await page.goto("/");
    expect(response?.ok(), `Home ${viewport.width}px returned ${response?.status()}`).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.getByRole("heading", { level: 1, name: /Traditional pooja/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop pooja essentials" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Shop by category" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Popular pooja items" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Visit the store/i })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search products" }).first()).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Camphor" }) }).getByRole("link", { name: /Camphor/i }).click();
  await expect(page).toHaveURL(/\/p\/karpooram-camphor/);
});

test("guest cart and account send the user to login", async ({ page }) => {
  await page.goto("/cart");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
});

test("home to checkout, track, and logout", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Traditional pooja/i })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search products" }).first();
  await search.fill("camphor");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=camphor/);
  await page.getByRole("link", { name: /Camphor/i }).first().click();
  await expect(page).toHaveURL(/\/p\/karpooram-camphor/);
  await expect(page.getByRole("heading", { level: 1, name: /Camphor/i })).toBeVisible();

  await signIn(context);
  await page.reload();
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeEnabled();

  const added = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Add to cart" }).click();
  expect((await added).ok(), "Add to cart request failed").toBeTruthy();
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /Your cart/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Camphor" }).first()).toBeVisible();
  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await fillDemoAddress(page);
  await expect(page).toHaveURL(/\/checkout/);

  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Checkout/i })).toBeVisible();
  await page.getByRole("radio").first().click();
  await expect(page.getByRole("button", { name: /Continue to payment/i })).toBeEnabled();
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page).toHaveURL(/\/order\/confirmation\//);

  await expect(page.getByText(/BG-/).first()).toBeVisible();
  const publicNumber = (await page.locator("#main-content h1").innerText()).trim();

  await page.locator("#main-content").getByRole("link", { name: "Track order" }).click();
  await expect(page).toHaveURL(/\/track/);
  await expect(page.getByLabel("Order number")).toHaveValue(publicNumber);
  await page.getByLabel("Mobile number used on the order").fill(PHONE);
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.getByRole("heading", { name: publicNumber })).toBeVisible();
  await expect(page.getByText(/Waiting for payment|Order placed|Packed at the store/i).first()).toBeVisible();

  await page.goto("/account/orders");
  await expect(page.getByRole("heading", { name: /Your orders/i })).toBeVisible();
  await expect(page.getByText(publicNumber)).toBeVisible();
  await page.getByRole("link", { name: publicNumber }).click();
  await expect(page.getByRole("heading", { name: publicNumber })).toBeVisible();

  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/cart");
  await expect(page).toHaveURL(/\/login/);
});

test("add to cart, address, cart count, and checkout totals", async ({ page, context }) => {
  await signIn(context);
  await page.goto("/p/karpooram-camphor");
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1, name: /Camphor/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 0 items/ })).toBeVisible();

  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByLabel("Quantity", { exact: true })).toHaveText("2");

  const added = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Add to cart" }).click();
  expect((await added).ok(), "Add to cart request failed").toBeTruthy();
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/Added to cart/i);

  await page.getByRole("link", { name: /Cart, 2 items/ }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Your cart/i })).toBeVisible();
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("2");
  await expect(page.getByText(/₹\s*178\.00/).first()).toBeVisible();
  await expect(page.getByText(/₹\s*50\.00/).first()).toBeVisible();
  await expect(page.getByText(/₹\s*228\.00/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  const increased = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: /Increase quantity of Camphor/ }).click();
  expect((await increased).ok(), "Increase quantity failed").toBeTruthy();
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("3");
  await expect(page.getByRole("link", { name: /Cart, 3 items/ })).toBeVisible();
  await expect(page.getByText(/₹\s*267\.00/).first()).toBeVisible();

  const decreased = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: /Decrease quantity of Camphor/ }).click();
  expect((await decreased).ok(), "Decrease quantity failed").toBeTruthy();
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("2");
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByLabel("Mobile number")).toHaveValue(PHONE);
  await fillDemoAddress(page);
  await expect(page).toHaveURL(/\/checkout/);

  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Checkout/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();
  await expect(page.getByText("Test Buyer")).toBeVisible();
  await expect(page.getByText(/1 Demo Street/)).toBeVisible();
  await expect(page.getByText(/110001/)).toBeVisible();
  await expect(page.getByText(/Camphor.*50g × 2/i)).toBeVisible();
  await expect(page.getByText(/₹\s*178\.00/).first()).toBeVisible();
  await expect(page.getByText(/₹\s*50\.00/).first()).toBeVisible();
  await expect(page.getByText(/₹\s*228\.00/).first()).toBeVisible();

  await page.getByRole("radio").first().click();
  await expect(page.getByRole("button", { name: /Continue to payment/i })).toBeEnabled();
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page).toHaveURL(/\/order\/confirmation\//);

  await expect(page.getByText(/Camphor.*× 2/i)).toBeVisible();
  await expect(page.getByText("Test Buyer")).toBeVisible();
  await expect(page.getByText(/110001/)).toBeVisible();
  await expect(page.getByText(/₹\s*228\.00/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 0 items/ })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /Your cart is empty/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 0 items/ })).toBeVisible();
});

test("listing add to cart stays in sync with details and cart", async ({ page, context }) => {
  await page.goto("/shop");
  const guestCard = page.getByRole("article").filter({ hasText: /Camphor/i });
  await guestCard.getByRole("button", { name: "Add to cart" }).click();
  await expect(page).toHaveURL(/\/login/);

  await signIn(context);
  const pendingAdded = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "POST",
  );
  await page.goto("/shop");
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  expect((await pendingAdded).ok(), "Listing add after login failed").toBeTruthy();

  const card = page.getByRole("article").filter({ hasText: /Camphor/i });
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();
  await expect(card.getByLabel(/Quantity of Camphor/)).toHaveText("1");

  const increased = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await card.getByRole("button", { name: /Increase quantity of Camphor/ }).click();
  expect((await increased).ok(), "Listing increase failed").toBeTruthy();
  await expect(card.getByLabel(/Quantity of Camphor/)).toHaveText("2");
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  const decreasedOnListing = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await card.getByRole("button", { name: /Decrease quantity of Camphor/ }).click();
  expect((await decreasedOnListing).ok(), "Listing decrease failed").toBeTruthy();
  await expect(card.getByLabel(/Quantity of Camphor/)).toHaveText("1");
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();

  const increasedAgain = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await card.getByRole("button", { name: /Increase quantity of Camphor/ }).click();
  expect((await increasedAgain).ok(), "Listing increase after decrease failed").toBeTruthy();
  await expect(card.getByLabel(/Quantity of Camphor/)).toHaveText("2");

  await card.getByRole("link", { name: /Camphor/i }).click();
  await expect(page).toHaveURL(/\/p\/karpooram-camphor/);
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("2");

  const decreased = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: /Decrease quantity of Camphor/ }).click();
  expect((await decreased).ok(), "Details decrease failed").toBeTruthy();
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("1");
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();

  await page.goto("/shop");
  const shopCard = page.getByRole("article").filter({ hasText: /Camphor/i });
  await expect(shopCard.getByLabel(/Quantity of Camphor/)).toHaveText("1");

  await page.goto("/cart");
  await expect(page.getByLabel(/Quantity of Camphor/)).toHaveText("1");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("heading", { name: /Your cart is empty/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 0 items/ })).toBeVisible();

  await page.goto("/shop");
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  const emptyCard = page.getByRole("article").filter({ hasText: /Camphor/i });
  await expect(emptyCard.getByRole("button", { name: "Add to cart" })).toBeVisible();

  const added = page.waitForResponse(
    (response) => response.url().includes("/api/cart/items") && response.request().method() === "POST",
  );
  await emptyCard.getByRole("button", { name: "Add to cart" }).click();
  expect((await added).ok(), "Signed-in listing add to cart failed").toBeTruthy();
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();
  await expect(emptyCard.getByLabel(/Quantity of Camphor/)).toHaveText("1");

  await page.reload();
  await expect(page.locator("html[data-cart-ready='true']")).toBeAttached({ timeout: 15_000 });
  const reloadedCard = page.getByRole("article").filter({ hasText: /Camphor/i });
  await expect(page.getByRole("link", { name: /Cart, 1 item/ })).toBeVisible();
  await expect(reloadedCard.getByLabel(/Quantity of Camphor/)).toHaveText("1");
});

