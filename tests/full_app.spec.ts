import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true,
  baseURL: 'https://localhost:5173',
  screenshot: 'on',
  trace: 'on',
});

test('full app login and dashboard verification', async ({ page }) => {
  // Go to the app
  console.log('Navigating to root...');
  await page.goto('/');
  await page.screenshot({ path: 'tests/step0_root.png' });
  
  // Verify redirected to login or shows login
  await expect(page).toHaveTitle(/Pyramid FM/i);
  
  // Step 1: Corporate Identity
  // Use "SYSTEM" for global admin access
  console.log('Filling Corporate Identity with SYSTEM...');
  const orgInput = page.getByPlaceholder('Organization ID');
  await orgInput.waitFor({ state: 'visible' });
  await orgInput.fill('SYSTEM');
  await page.screenshot({ path: 'tests/step1_org_filled.png' });
  
  console.log('Clicking Continue...');
  await page.click('button:has-text("Continue to Access")');
  
  // Step 2: Personnel Login
  console.log('Waiting for Personnel Login field...');
  const userInput = page.getByPlaceholder('Username or Email');
  await userInput.waitFor({ state: 'visible', timeout: 5000 });
  
  console.log('Filling credentials for master user...');
  await userInput.fill('master@pyramidfms.com');
  
  const passInput = page.locator('input[type="password"]');
  await passInput.fill('master2026');
  await page.screenshot({ path: 'tests/step3_creds_filled.png' });
  
  console.log('Clicking Authorize...');
  await page.click('button:has-text("Authorize Terminal Access")');
  
  // Wait for dashboard to load
  console.log('Waiting for redirect to /admin...');
  try {
    // Admin login should navigate to /admin
    await page.waitForURL('**/admin', { timeout: 15000 });
    console.log('Redirect successful!');
  } catch (e) {
    console.log('Redirect failed or timed out. Current URL:', page.url());
    await page.screenshot({ path: 'tests/step4_failure_url.png' });
    
    // Check for error message
    const errorBadge = page.locator('.status-badge.danger');
    if (await errorBadge.isVisible()) {
      console.log('Error Message visible on page:', await errorBadge.innerText());
    }
    throw e;
  }
  
  // Take a final screenshot of the admin dashboard
  await page.waitForTimeout(3000); 
  await page.screenshot({ path: 'tests/dashboard_screenshot.png', fullPage: true });
  
  // Verify presence of "Admin" or "Overview"
  const dashboardHeading = page.locator('h1, h2, h3').filter({ hasText: /Admin/i });
  await expect(dashboardHeading.first()).toBeVisible();
  
  console.log('Login successful and Admin Dashboard verified.');
});
