import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Stats Test User',
  email: `statstest_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

const statsSection = (page: import('@playwright/test').Page) =>
  page.locator('[aria-label="Applications statistics"]');

const statValue = (page: import('@playwright/test').Page, label: string) =>
  statsSection(page).locator('.applications-stat-card').filter({ hasText: label }).locator('strong');

test.describe('Dashboard Statistics Flow', () => {
  test.setTimeout(60000);

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(90000);
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
    // 2 aplicatii APPLIED
    for (const company of ['Applied Corp 1', 'Applied Corp 2']) {
      await page.goto('/applications/new');
      await page.getByLabel('Company name').fill(company);
      await page.getByLabel('Role').fill('Developer');
      await page.getByLabel('Status').selectOption('APPLIED');
      await page.getByLabel('Application date').fill('2026-04-14');
      await page.getByRole('button', { name: 'Save application' }).click();
      await expect(page).toHaveURL('/');
    }
    // 1 aplicatie INTERVIEW
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Interview Corp');
    await page.getByLabel('Role').fill('Developer');
    await page.getByLabel('Status').selectOption('INTERVIEW');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');
    // 1 aplicatie OFFER
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Offer Corp');
    await page.getByLabel('Role').fill('Developer');
    await page.getByLabel('Status').selectOption('OFFER');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');
    // 1 aplicatie REJECTED
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Rejected Corp');
    await page.getByLabel('Role').fill('Developer');
    await page.getByLabel('Status').selectOption('REJECTED');
    await page.getByLabel('Application date').fill('2026-04-14');
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
    // asteapta ca statisticile sa se incarce
    await expect(statValue(page, 'Total applications')).not.toHaveText('...');
  });

  // TC1 - sectiunea de statistici este vizibila
  test('TC1 - dashboard statistics section is visible', async ({ page }) => {
    await expect(statsSection(page)).toBeVisible();
    await expect(statValue(page, 'Total applications')).toBeVisible();
    await expect(statValue(page, 'Applied')).toBeVisible();
    await expect(statValue(page, 'Interview')).toBeVisible();
    await expect(statValue(page, 'Offer')).toBeVisible();
    await expect(statValue(page, 'Rejected')).toBeVisible();
  });

  // TC2 - totalul reflecta numarul corect de aplicatii
  test('TC2 - total count reflects number of created applications', async ({ page }) => {
    await expect(statValue(page, 'Total applications')).toHaveText('5');
  });

  // TC3 - contoarele per status sunt corecte
  test('TC3 - per-status counts are correct', async ({ page }) => {
    await expect(statValue(page, 'Applied')).toHaveText('2');
    await expect(statValue(page, 'Interview')).toHaveText('1');
    await expect(statValue(page, 'Offer')).toHaveText('1');
    await expect(statValue(page, 'Rejected')).toHaveText('1');
  });

  // TC4 - statisticile se actualizeaza dupa adaugarea unei aplicatii
  test('TC4 - stats update after adding a new application', async ({ page }) => {
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('New Applied Corp');
    await page.getByLabel('Role').fill('Developer');
    await page.getByLabel('Status').selectOption('APPLIED');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');

    await expect(statValue(page, 'Total applications')).not.toHaveText('...');
    await expect(statValue(page, 'Total applications')).toHaveText('6');
    await expect(statValue(page, 'Applied')).toHaveText('3');
  });

  // TC5 - statisticile se actualizeaza dupa stergerea unei aplicatii
  test('TC5 - stats update after deleting an application', async ({ page }) => {
    const initialTotal = await statValue(page, 'Total applications').textContent();
    const expectedTotal = String(Number(initialTotal) - 1);

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(statValue(page, 'Total applications')).not.toHaveText('...');
    await expect(statValue(page, 'Total applications')).toHaveText(expectedTotal);
  });

  // TC6 - user nou fara aplicatii vede toate statisticile = 0
  test('TC6 - new user with no applications sees all stats as zero', async ({ browser }) => {
    const emptyEmail = `statsempty_${TIMESTAMP}@example.com`;
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/register');
    await page.getByLabel('Full name').fill('Stats Empty User');
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
    await expect(statValue(page, 'Total applications')).not.toHaveText('...');

    await expect(statValue(page, 'Total applications')).toHaveText('0');
    await expect(statValue(page, 'Applied')).toHaveText('0');
    await expect(statValue(page, 'Interview')).toHaveText('0');
    await expect(statValue(page, 'Offer')).toHaveText('0');
    await expect(statValue(page, 'Rejected')).toHaveText('0');
    await context.close();
  });
});
