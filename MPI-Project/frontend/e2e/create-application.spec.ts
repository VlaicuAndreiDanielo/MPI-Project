import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Create App User',
  email: `createapp_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Create Application Flow', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/register');
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('.auth-message-success').waitFor();
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
    await page.goto('/applications/new');
  });

  // TC1
  test('TC1 - create application page loads with all fields', async ({ page }) => {
    await expect(page.getByLabel('Company name')).toBeVisible();
    await expect(page.getByLabel('Role')).toBeVisible();
    await expect(page.getByLabel('Status')).toBeVisible();
    await expect(page.getByLabel('Application date')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save application' })).toBeVisible();
  });

  // TC2
  test('TC2 - successful creation redirects to applications list', async ({ page }) => {
    await page.getByLabel('Company name').fill('Google');
    await page.getByLabel('Role').fill('Software Engineer');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();

    await expect(page).toHaveURL('/');
  });

  // TC4 - status dropdown contine doar valori valide
  test('TC4 - status dropdown contains only valid values', async ({ page }) => {
    const options = page.getByLabel('Status').locator('option');
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveText('Applied');
    await expect(options.nth(1)).toHaveText('Interview');
    await expect(options.nth(2)).toHaveText('Offer');
    await expect(options.nth(3)).toHaveText('Rejected');
  });

  // TC8 - unauthenticated redirect
  test('TC8 - unauthenticated user cannot access create form', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/applications/new');
    await expect(page).toHaveURL('/login');
    await context.close();
  });

  // TC11 - buton dezactivat in timpul submitului
  test('TC11 - submit button is disabled while submitting', async ({ page }) => {
    await page.getByLabel('Company name').fill('Amazon');
    await page.getByLabel('Role').fill('DevOps Engineer');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();

    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  // TC13 - aplicatia apare in lista dupa creare
  test('TC13 - new application appears in list after creation', async ({ page }) => {
    await page.getByLabel('Company name').fill('Meta');
    await page.getByLabel('Role').fill('Frontend Developer');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Meta')).toBeVisible();
    await expect(page.getByText('Frontend Developer')).toBeVisible();
  });
});
