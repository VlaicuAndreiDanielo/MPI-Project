import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const TEST_USER = {
  fullName: 'Edit Test User',
  email: `edittest_${TIMESTAMP}@example.com`,
  password: 'Password123',
};

test.describe('Edit Application Flow', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/register');
    await page.getByLabel('Full name').fill(TEST_USER.fullName);
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER.password);
    await page.getByLabel('Confirm password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.locator('.auth-message-success').waitFor();
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/');
    await page.goto('/applications/new');
    await page.getByLabel('Company name').fill('Google');
    await page.getByLabel('Role').fill('Software Engineer');
    await page.getByLabel('Status').selectOption('APPLIED');
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
    await page.getByRole('link', { name: 'Edit' }).first().click();
    await expect(page).toHaveURL(/\/applications\/.*\/edit/);
    // asteapta ca datele sa se incarce din API
    await expect(page.getByLabel('Company name')).not.toHaveValue('');
  });

  // TC1 - pagina se incarca cu campurile pre-completate
  test('TC1 - edit page loads with pre-filled data', async ({ page }) => {
    await expect(page.getByLabel('Company name')).toHaveValue('Google');
    await expect(page.getByLabel('Role')).toHaveValue('Software Engineer');
    await expect(page.getByLabel('Status')).toHaveValue('APPLIED');
  });

  // TC2 - update cu succes redirecteaza la lista
  test('TC2 - successful update redirects to applications list', async ({ page }) => {
    await page.getByLabel('Company name').fill('Google Updated');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL('/');
  });

  // TC3 - update partial (doar status)
  test('TC3 - partial update changes only modified field', async ({ page }) => {
    // retine URL-ul aplicatiei curente
    const editUrl = page.url();
    await page.getByLabel('Status').selectOption('INTERVIEW');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL('/');
    // redeschide aceeasi aplicatie folosind URL-ul retinut
    await page.goto(editUrl);
    await expect(page).toHaveURL(/\/applications\/.*\/edit/);
    await expect(page.getByLabel('Company name')).not.toHaveValue('');
    await expect(page.locator('select#status')).toHaveValue('INTERVIEW');
  });

  // TC11 - buton dezactivat in timpul submitului
  test('TC11 - submit button is disabled while submitting', async ({ page }) => {
    await page.route('**/applications/**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  // NOTE1 - adauga o nota
  test('NOTE1 - add note appears in notes list', async ({ page }) => {
    await page.locator('textarea').first().fill('Interview scheduled for next week');
    await page.getByRole('button', { name: 'Add note' }).click();

    await expect(page.getByText('Interview scheduled for next week')).toBeVisible();
  });

  // NOTE2 - editeaza o nota existenta
  test('NOTE2 - edit note updates content', async ({ page }) => {
    await page.locator('textarea').first().fill('Original note content');
    await page.getByRole('button', { name: 'Add note' }).click();
    await expect(page.getByText('Original note content')).toBeVisible();

    const noteToEdit = page.locator('.notes-item').filter({ hasText: 'Original note content' });
    await noteToEdit.getByRole('button', { name: 'Edit note' }).click();
    const editTextarea = noteToEdit.locator('textarea');
    await editTextarea.waitFor({ state: 'visible' });
    await editTextarea.click({ clickCount: 3 });
    await page.keyboard.type('Updated note content');
    await page.getByRole('button', { name: 'Save note' }).click();

    await expect(page.getByText('Updated note content')).toBeVisible();
    await expect(page.locator('.notes-list').getByText('Original note content')).not.toBeVisible();
  });

  // NOTE3 - sterge o nota
  test('NOTE3 - delete note removes it from list', async ({ page }) => {
    await page.locator('textarea').first().fill('Note to delete');
    await page.getByRole('button', { name: 'Add note' }).click();
    await expect(page.getByText('Note to delete')).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.notes-item').filter({ hasText: 'Note to delete' }).getByRole('button', { name: 'Delete note' }).click();

    await expect(page.locator('.notes-item').filter({ hasText: 'Note to delete' })).not.toBeVisible();
  });

  // NOTE4 - cancel edit nota
  test('NOTE4 - cancel edit note keeps original content', async ({ page }) => {
    await page.locator('textarea').first().fill('Note to keep');
    await page.getByRole('button', { name: 'Add note' }).click();
    await expect(page.getByText('Note to keep')).toBeVisible();

    await page.getByRole('button', { name: 'Edit note' }).first().click();
    await page.locator('.notes-list textarea').fill('Changed content');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText('Note to keep')).toBeVisible();
    await expect(page.locator('.notes-list p').filter({ hasText: 'Changed content' })).not.toBeVisible();
  });

  // TC9 - unauthenticated redirect
  test('TC9 - unauthenticated user cannot access edit page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/applications/some-id/edit');
    await expect(page).toHaveURL('/login');
    await context.close();
  });
});
