import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Test User',
  email: `testuser_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // TC1 - pagina se incarca cu toate campurile vizibile
  test('TC1 - registration page loads with all required fields', async ({ page }) => {
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  // TC2 - inregistrare cu succes afiseaza mesaj de confirmare
  test('TC2 - successful registration shows confirmation message', async ({ page }) => {
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.locator('.auth-message-success')).toBeVisible();
  });

  // TC7 - email deja existent afiseaza eroare
  test('TC7 - duplicate email shows error message', async ({ page }) => {
    const duplicateEmail = `duplicate_${TIMESTAMP}@example.com`;

    // prima inregistrare
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(duplicateEmail);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.locator('.auth-message-success')).toBeVisible();

    // a doua incercare cu acelasi email
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(duplicateEmail);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.locator('.auth-message-error')).toBeVisible();
  });

  // TC9 - campurile de parola sunt mascate implicit
  test('TC9 - password fields are masked by default', async ({ page }) => {
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Confirm password')).toHaveAttribute('type', 'password');
  });

  // TC11 - butonul e dezactivat in timpul submitului
  test('TC11 - submit button is disabled while submitting', async ({ page }) => {
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(`submit_${TIMESTAMP}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);

    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
  });

  // TC12 - campurile retin valorile dupa eroare (passwords mismatch)
  test('TC12 - input fields retain values after validation error', async ({ page }) => {
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Email').fill('retain@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm password').fill('Different123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.locator('.auth-message-error')).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveValue('Test User');
    await expect(page.getByLabel('Email')).toHaveValue('retain@example.com');
  });
});
