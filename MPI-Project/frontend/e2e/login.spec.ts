import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Login Test User',
  email: `logintest_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Login Flow', () => {
  // inregistram userul inainte de toate testele
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
  });

  // TC1
  test('TC1 - login page loads with all required fields', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  // TC2
  test('TC2 - successful login redirects to dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/');
  });

  // TC5
  test('TC5 - incorrect password shows error', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.auth-message-error')).toBeVisible();
  });

  // TC6
  test('TC6 - non-existent email shows error', async ({ page }) => {
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.auth-message-error')).toBeVisible();
  });

  // TC8
  test('TC8 - password field is masked by default', async ({ page }) => {
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });

  // TC11
  test('TC11 - submit button is disabled while submitting', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });

  // TC12
  test('TC12 - unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
