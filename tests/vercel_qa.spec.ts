import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'https://pyramid-fm-two.vercel.app',
  screenshot: 'on',
  trace: 'on',
});

test('vercel live app qa test', async ({ page }) => {
  console.log('Navigating to Vercel Login...');
  await page.goto('/login');
  await page.screenshot({ path: 'tests/vercel_step0.png' });
  
  // Step 1: Click "Field Workforce Access"
  // Based on Login.tsx, it's a button with "Field Workforce Access" text
  const workforceBtn = page.locator('button').filter({ hasText: 'Field Workforce Access' });
  console.log('Clicking Field Workforce Access...');
  await workforceBtn.click();
  await page.screenshot({ path: 'tests/vercel_step1_clicked.png' });
  
  // Step 2: Personnel Login
  console.log('Filling personnel credentials...');
  const userInput = page.getByPlaceholder('Username or Email');
  await userInput.waitFor({ state: 'visible' });
  await userInput.fill('sameer@pyramidfm.com');
  
  const passInput = page.locator('input[type="password"]');
  await passInput.fill('emp123');
  await page.screenshot({ path: 'tests/vercel_step2_filled.png' });
  
  console.log('Authorizing...');
  await page.click('button:has-text("Authorize Terminal Access")');
  
  // Step 3: Verify Redirect
  console.log('Waiting for workforce portal redirect...');
  // Usually redirects to /employee/dashboard or /portal
  try {
    await page.waitForURL('**/employee/dashboard**', { timeout: 15000 });
    console.log('Successfully reached Workforce Portal.');
  } catch (e) {
    console.log('Redirect failed. Current URL:', page.url());
    const errorBadge = page.locator('.status-badge.danger');
    if (await errorBadge.isVisible()) {
      console.log('Login Error Message:', await errorBadge.innerText());
    }
    await page.screenshot({ path: 'tests/vercel_failure.png' });
    throw e;
  }
  
  // Final verification
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/vercel_dashboard.png', fullPage: true });
  
  const heading = page.locator('h1, h2, h3').filter({ hasText: /Workforce|Dashboard|Sameer/i });
  await expect(heading.first()).toBeVisible();
  
  console.log('QA Test Completed Successfully.');
});
