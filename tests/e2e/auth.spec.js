import { test, expect } from "@playwright/test";

test("public landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("ResumeIQ sharpens your resume")).toBeVisible();
});

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("user can sign up and reach upload workspace", async ({ page }) => {
  const email = `playwright-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.getByPlaceholder("Avery Johnson").fill("Playwright User");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("At least 8 characters").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/upload/);
  await expect(page.getByText("Upload a new resume")).toBeVisible();
});

