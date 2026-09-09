import { expect, test } from "@playwright/test";

test("MVP-01 login submits the only credential the server accepts", async ({ page }) => {
  let submittedBody: unknown = null;

  await page.route("**/api/auth/login", async (route) => {
    submittedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "Invalid password" }),
    });
  });

  await page.goto("/login");

  await expect(page.getByLabel("Enter username")).toHaveCount(0);
  await page.getByLabel("Enter password").fill("not-the-real-password");
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page.getByText("Invalid password", { exact: true })).toBeVisible();
  expect(submittedBody).toEqual({ password: "not-the-real-password" });
});
