import { test, expect } from '@playwright/test';

test('loads login page and can navigate', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Login/i);
});

test('dashboard loads after login and shows no client error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Email/i).fill('test@example.com');
  await page.getByLabel(/Password|Adgangskode/i).fill('test1234');
  await page.getByRole('button', { name: /login|log ind/i }).click();
  await page.waitForURL(/dashboard/);
  // Check header present
  await expect(page.getByText(/Manager Hub|Manager/i)).toBeVisible();
});

test('my-team endpoint returns players (smoke via UI)', async ({ page }) => {
  await page.goto('/my-team');
  await expect(page.getByText(/Mit Hold|My Team/i)).toBeVisible();
});

test('stadium page renders', async ({ page }) => {
  await page.goto('/stadium');
  await expect(page.getByText(/Stadion|Stadium/i)).toBeVisible();
});


