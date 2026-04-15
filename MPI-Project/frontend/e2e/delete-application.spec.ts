import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Delete Test User',
  email: `deletetest_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Delete Application Flow', () => {
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
    // cream o aplicatie proaspata pentru fiecare test
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('To Delete Corp');
    await page.getByLabel('Role').fill('Tester');
    await page.getByLabel('Application date').fill('2026-04-14');
    await page.getByRole('button', { name: 'Save application' }).click();
    await expect(page).toHaveURL('/');
  });

  // TC2 - dialog de confirmare apare
  test('TC2 - confirmation dialog appears on delete', async ({ page }) => {
    let dialogAppeared = false;
    page.on('dialog', async (dialog) => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();
    expect(dialogAppeared).toBe(true);
  });

  // TC3 - cancel deletion - aplicatia ramane
  test('TC3 - cancel deletion keeps application in list', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.dismiss());

    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByRole('cell', { name: 'To Delete Corp' }).first()).toBeVisible();
  });

  // TC4 - confirmare stergere - aplicatia dispare
  test('TC4 - confirm deletion removes application from list', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: 'Delete' }).first().waitFor();
    const initialCount = await page.getByRole('button', { name: 'Delete' }).count();
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(initialCount - 1);
  });

  // TC11 - stergere ultima aplicatie afiseaza empty state
  test('TC11 - deleting last application shows empty state', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await expect(page.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
    let deleteCount = await page.getByRole('button', { name: 'Delete' }).count();

    while (deleteCount > 0) {
      await page.getByRole('button', { name: 'Delete' }).first().click();
      deleteCount--;
      if (deleteCount > 0) {
        await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(deleteCount);
      } else {
        await expect(page.locator('.applications-state')).toBeVisible();
      }
    }

    await expect(page.locator('.applications-state')).toContainText('No applications yet');
  });
});
