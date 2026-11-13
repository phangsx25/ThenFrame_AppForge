import { test, expect } from "@playwright/test";
// These fixtures intercept network requests. They never create real accounts or data.
async function backend(page, role = "customer") {
  const state = { collections: [], photos: [], requests: [] };
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated",
    role: "authenticated",
    email: "fixture@example.test",
    app_metadata: { provider: "email" },
    user_metadata: { display_name: "Test member" },
    created_at: new Date().toISOString(),
  };
  const jwt = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url"),
    "fixture",
  ].join(".");
  await page.route("https://thenframe-test.supabase.co/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      method = req.method();
    state.requests.push({ method, path: url.pathname, search: url.search });
    const send = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.pathname.endsWith("/token"))
      return send({
        access_token: jwt,
        refresh_token: "fixture-refresh",
        token_type: "bearer",
        expires_in: 3600,
        user,
      });
    if (url.pathname.endsWith("/signup")) return send({ user, session: null });
    if (url.pathname.endsWith("/logout")) return send({});
    if (url.pathname.endsWith("/user")) return send(user);
    if (url.pathname.includes("/profiles"))
      return send({ id: user.id, display_name: "Test member", role });
    if (method === "GET" && url.pathname.includes("/storage/v1/"))
      return route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJqkAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    if (url.pathname.includes("/storage/v1/object/sign/"))
      return send({
        signedURL: "/object/sign/gallery/fixture.jpg?token=fixture",
      });
    if (url.pathname.includes("/storage/v1/"))
      return send({ Key: "gallery/fixture.jpg" });
    const table = url.pathname.includes("gallery_photos")
      ? "photos"
      : "collections";
    let rows = state[table];
    const id = url.searchParams.get("id")?.replace("eq.", "");
    const collectionId = url.searchParams
      .get("collection_id")
      ?.replace("eq.", "");
    if (method === "POST") {
      const body = req.postDataJSON(),
        row = {
          ...body,
          id: `${table}-${state[table].length + 1}`,
          created_at: new Date().toISOString(),
        };
      state[table].push(row);
      return send(row, 201);
    }
    if (method === "PATCH") {
      const row = rows.find((item) => item.id === id);
      Object.assign(row, req.postDataJSON());
      return send(row);
    }
    if (method === "DELETE") {
      const row = rows.find((item) => item.id === id);
      state[table] = rows.filter((item) => item.id !== id);
      return send(row);
    }
    if (collectionId)
      rows = rows.filter((item) => item.collection_id === collectionId);
    if (id) rows = rows.filter((item) => item.id === id);
    if (url.searchParams.get("visibility") === "eq.public")
      rows = rows.filter((item) => item.visibility === "public");
    return send(rows);
  });
  return state;
}
async function signIn(page, admin = false) {
  await page.goto(admin ? "/#/admin/login" : "/#/login");
  await page
    .getByLabel(admin ? "Staff email address" : "Email address", {
      exact: true,
    })
    .fill("fixture@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("fixture-password123");
  await page
    .getByRole("button", {
      name: admin ? "Login to Admin Dashboard" : "Login",
      exact: true,
    })
    .click();
}
async function noOverflow(page) {
  const layout = await page.evaluate(() => ({
    fits: document.documentElement.scrollWidth <= window.innerWidth + 1,
    viewport: window.innerWidth,
    width: document.documentElement.scrollWidth,
    overflowing: [...document.querySelectorAll("body *")]
      .filter(
        (el) =>
          el.getBoundingClientRect().right > window.innerWidth + 1 &&
          getComputedStyle(el).position !== "absolute",
      )
      .slice(0, 12)
      .map((el) => ({
        tag: el.tagName,
        className: String(el.className),
        right: Math.round(el.getBoundingClientRect().right),
      })),
  }));
  expect(layout, JSON.stringify(layout)).toMatchObject({ fits: true });
}

test("customer registration sends the form and requests confirmation; no role is supplied", async ({
  page,
}) => {
  const state = await backend(page);
  await page.goto("/#/register");
  await page.getByLabel("Full name").fill("A new customer");
  await page.getByLabel("Email address").fill("new@example.test");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("password123");
  await page.getByRole("checkbox").check();
  const request = page.waitForRequest((req) => req.url().includes("/signup"));
  await page.getByRole("button", { name: "Register", exact: true }).click();
  expect((await request).postDataJSON().data).toEqual({
    display_name: "A new customer",
  });
  await expect(page.getByRole("status")).toContainText("Check your email");
  expect(state.requests.some((req) => req.path.endsWith("/signup"))).toBe(true);
  await noOverflow(page);
});

test("customer login, reload, direct admin denial and logout use Supabase session lifecycle", async ({
  page,
}) => {
  await backend(page);
  await signIn(page);
  await expect(
    page.getByRole("heading", { name: "Welcome back, Test member." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Test member." }),
  ).toBeVisible();
  await page.goto("/#/admin");
  await expect(
    page.getByRole("heading", { name: "Studio access only." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Go to your customer space" }).click();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back.", exact: true }),
  ).toBeVisible();
  await page.goto("/#/dashboard");
  await expect(
    page.getByRole("heading", { name: "Your space, securely kept." }),
  ).toBeVisible();
});

test("admin form refuses a customer account", async ({ page }) => {
  await backend(page);
  await page.goto("/#/login");
  await page
    .getByRole("navigation", { name: "Login role" })
    .getByRole("link", { name: "Admin", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Studio Login." }),
  ).toBeVisible();
  await page
    .getByLabel("Staff email address", { exact: true })
    .fill("fixture@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("fixture-password123");
  await page.getByRole("button", { name: "Login to Admin Dashboard" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "does not have studio admin access",
  );
  await expect(
    page.getByRole("heading", { name: "Studio Login." }),
  ).toBeVisible();
});

test("admin creates, edits, uploads, publishes and deletes only its test gallery; visitor filter works", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await signIn(page, true);
  await expect(
    page.getByRole("heading", { name: "Welcome to ThenFrame Studio" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "＋ New collection" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Wedding story");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A real form submission with a test transport.");
  await page
    .getByLabel("Photography style", { exact: true })
    .fill("Traditional Malay");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Collection saved.");
  expect(state.collections[0].visibility).toBe("hidden");
  await page
    .getByRole("button", { name: "Edit collection", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Visibility", { exact: true })
    .selectOption("public");
  await page
    .getByRole("button", { name: "Save collection", exact: true })
    .click();
  await page.getByLabel("Photograph", { exact: true }).setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJqkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("Caption", { exact: true }).fill("A wedding moment");
  await page.getByRole("button", { name: "Upload photo", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Photo uploaded.");
  expect(state.photos).toHaveLength(1);
  expect(state.photos[0].visibility).toBe("hidden");
  await page.getByRole("button", { name: "Edit photo", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Visibility", { exact: true })
    .selectOption("public");
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Photograph updated.");
  await page.screenshot({
    path: "test-results/admin-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "test-results/admin-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Back to website" }).click();
  await expect(
    page.getByRole("heading", { name: "Wedding story" }),
  ).toBeVisible();
  await page.getByLabel("Find a story").fill("unmatched");
  await expect(
    page.getByRole("heading", { name: "No stories match your search." }),
  ).toBeVisible();
  await page.goto("/#/admin");
  await page.getByRole("button", { name: "Manage", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Deleted.");
  expect(state.photos).toHaveLength(0);
  await page.getByRole("button", { name: "Delete empty collection" }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A new story starts here." }),
  ).toBeVisible();
  expect(state.collections).toHaveLength(0);
  expect(errors).toEqual([]);
});

test("wireframe theme and mobile layout remain consistent across public and auth screens", async ({
  page,
}) => {
  await backend(page);
  for (const [route, name] of [
    ["/", "home"],
    ["/portfolio", "portfolio"],
    ["/login", "login"],
    ["/register", "register"],
    ["/admin/login", "admin-login"],
  ]) {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto("/#" + route);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--wine")
          .trim(),
      ),
    ).toBe("#7d2e46");
    await page.screenshot({
      path: `test-results/${name}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await noOverflow(page);
    await page.screenshot({
      path: `test-results/${name}-mobile.png`,
      fullPage: true,
    });
  }
});

test("password recovery callback opens the update form and submits to Supabase", async ({
  page,
}) => {
  await backend(page);
  await signIn(page);
  await expect(
    page.getByRole("heading", { name: "Welcome back, Test member." }),
  ).toBeVisible();
  await page.goto("/?auth=password");
  await expect(
    page.getByRole("heading", { name: "Choose a new password." }),
  ).toBeVisible();
  await page
    .getByLabel("New password", { exact: true })
    .fill("changedPassword123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("changedPassword123");
  const update = page.waitForRequest(
    (req) => req.method() === "PUT" && req.url().includes("/auth/v1/user"),
  );
  await page
    .getByRole("button", { name: "Update password", exact: true })
    .click();
  expect((await update).postDataJSON().password).toBe("changedPassword123");
  await expect(page.getByRole("status")).toContainText("Password updated.");
});
