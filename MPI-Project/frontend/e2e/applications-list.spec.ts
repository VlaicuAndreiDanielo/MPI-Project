import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'List Test User',
  email: `listtest_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Applications List Flow', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    // inregistrare
    await page.goto('/register');
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('.auth-message-success').waitFor();
    // login
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
    // cream aplicatie cu status INTERVIEW
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Google');
    await page.getByLabel('Role').fill('Software Engineer');
    await page.getByLabel('Status').selectOption('INTERVIEW');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');
    // cream aplicatie cu status APPLIED
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Amazon');
    await page.getByLabel('Role').fill('Backend Developer');
    await page.getByLabel('Status').selectOption('APPLIED');
    await page.getByLabel('Application date').fill('2026-04-10');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
  });

  // TC1
  test('TC1 - applications list page loads successfully', async ({ page }) => {
    await expect(page.locator('.applications-table, .applications-state')).toBeVisible();
  });

  // TC2 + TC3
  test('TC2/TC3 - displays correct application data', async ({ page }) => {
    await expect(page.getByText('Google')).toBeVisible();
    await expect(page.getByText('Software Engineer')).toBeVisible();
    await expect(page.locator('.status-pill.status-interview')).toBeVisible();
  });

  // TC4 - empty state
  test('TC4 - empty state shown when no applications exist', async ({ browser }) => {
    const emptyEmail = `empty_${TIMESTAMP}@example.com`;
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/register');
    await page.getByLabel('Full name').fill('Empty User');
    await page.getByLabel('Email').fill(emptyEmail);
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('.auth-message-success').waitFor();
    await page.goto('/login');
    await page.getByLabel('Email').fill(emptyEmail);
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');

    await expect(page.locator('.applications-state')).toContainText('No applications yet');
    await context.close();
  });

  // TC7 - unauthenticated redirect
  test('TC7 - unauthenticated user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    await context.close();
  });

  // TC8 - data isolation
  test('TC8 - user sees only their own applications', async ({ browser }) => {
    const otherEmail = `other_${TIMESTAMP}@example.com`;
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/register');
    await page.getByLabel('Full name').fill('Other User');
    await page.getByLabel('Email').fill(otherEmail);
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('.auth-message-success').waitFor();
    await page.goto('/login');
    await page.getByLabel('Email').fill(otherEmail);
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');

    await expect(page.getByText('Google')).not.toBeVisible();
    await context.close();
  });

  // TC13 - filter by status
  test('TC13 - filter by status shows only matching applications', async ({ page }) => {
    await page.getByLabel('Filter by status').selectOption('INTERVIEW');
    await expect(page.getByText('Google')).toBeVisible();

    await page.getByLabel('Filter by status').selectOption('OFFER');
    await expect(page.locator('.applications-state')).toBeVisible();
  });

  // FILTER1 - filter APPLIED
  test('FILTER1 - filter by APPLIED shows only applied applications', async ({ page }) => {
    await page.locator('.applications-table').waitFor();
    await page.getByLabel('Filter by status').selectOption('APPLIED');
    await expect(page.locator('.status-pill.status-applied')).toBeVisible();
    await expect(page.locator('.status-pill.status-interview')).not.toBeVisible();
  });

  // FILTER2 - filter ALL arata toate aplicatiile
  test('FILTER2 - filter by ALL shows all applications', async ({ page }) => {
    await page.locator('.applications-table').waitFor();
    await page.getByLabel('Filter by status').selectOption('INTERVIEW');
    await page.getByLabel('Filter by status').selectOption('ALL');
    await expect(page.locator('.status-pill.status-applied')).toBeVisible();
    await expect(page.locator('.status-pill.status-interview')).toBeVisible();
  });

  // FILTER3 - filter fara rezultate afiseaza empty state
  test('FILTER3 - filter with no results shows empty state message', async ({ page }) => {
    await page.getByLabel('Filter by status').selectOption('OFFER');
    await expect(page.locator('.applications-state')).toBeVisible();
  });
});
