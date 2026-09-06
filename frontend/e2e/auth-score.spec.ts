import { expect, test } from '@playwright/test';

test('rejects invalid credentials with a clear message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.user1');
  await page.getByLabel('Contraseña').fill('WrongPass!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByText('No pudimos iniciar sesión. Verifica tus credenciales.')).toBeVisible();
});

test('lets a user consult their RUT and blocks another RUT', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.user1');
  await page.getByLabel('Contraseña').fill('UserOneDemo!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: /Consulta el score por RUT/i })).toBeVisible();

  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('87')).toBeVisible();
  await expect(page.getByText('12.345.678-5')).toBeVisible();

  await page.getByLabel('RUT').fill('9.876.543-3');
  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('No tienes permiso para consultar este RUT.')).toBeVisible();
});

test('lets an administrator consult any valid RUT and log out', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.admin');
  await page.getByLabel('Contraseña').fill('AdminDemo!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await page.getByLabel('RUT').fill('9.876.543-3');
  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('33')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeVisible();
});
