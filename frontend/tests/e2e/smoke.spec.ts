import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('loads login page and can navigate', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/i);
  });

  test('complete login flow and dashboard', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Password|Adgangskode/i).fill('test1234');
    await page.getByRole('button', { name: /login|log ind/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/);
    await expect(page.getByText(/Manager Hub|Manager/i)).toBeVisible();
    
    // Check no JavaScript errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (like 404s for missing pages)
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('favicon') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('my-team page loads with players', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Password|Adgangskode/i).fill('test1234');
    await page.getByRole('button', { name: /login|log ind/i }).click();
    await page.waitForURL(/dashboard/);
    
    // Navigate to my-team
    await page.goto('/my-team');
    await expect(page.getByText(/Mit Hold|My Team/i)).toBeVisible();
    
    // Check that players are loaded (should show formation or player list)
    await expect(page.locator('[data-testid="player"], .player, [class*="player"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('stadium page loads without errors', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Password|Adgangskode/i).fill('test1234');
    await page.getByRole('button', { name: /login|log ind/i }).click();
    await page.waitForURL(/dashboard/);
    
    // Navigate to stadium
    await page.goto('/stadium');
    await expect(page.getByText(/Stadion|Stadium/i)).toBeVisible();
    
    // Check no critical JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('favicon') &&
      !error.includes('Failed to load resource') &&
      !error.includes('Settings is not defined')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('transfers page loads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByLabel(/Password|Adgangskode/i).fill('test1234');
    await page.getByRole('button', { name: /login|log ind/i }).click();
    await page.waitForURL(/dashboard/);
    
    // Navigate to transfers
    await page.goto('/transfers');
    await expect(page.getByText(/Transfer|Transferliste/i)).toBeVisible();
  });

  test('API endpoints respond correctly', async ({ page, request }) => {
    // Test backend health
    const healthResponse = await request.get('/health');
    expect(healthResponse.status()).toBe(200);
    
    // Test auth endpoint
    const authResponse = await request.get('/auth/me');
    // Should return 401 without cookies, which is expected
    expect([200, 401]).toContain(authResponse.status());
    
    // Test stadium endpoint
    const stadiumResponse = await request.get('/api/stadium/1');
    expect(stadiumResponse.status()).toBe(200);
    
    const stadiumData = await stadiumResponse.json();
    expect(stadiumData).toHaveProperty('id');
    expect(stadiumData).toHaveProperty('name');
  });
});


