import { expect, test } from '@playwright/test';

test('rejects invalid credentials with a clear message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.user1');
  await page.getByLabel('Contraseña').fill('WrongPass!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByText('No pudimos iniciar sesión. Verifica tus credenciales.')).toBeVisible();
});

test('persists a user session, allows its RUT, and blocks another RUT', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.user1');
  await page.getByLabel('Contraseña').fill('UserOneDemo!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: /Consulta el score por RUT/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: /Consulta el score por RUT/i })).toBeVisible();

  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('87')).toBeVisible();
  await expect(page.getByText('12.345.678-5')).toBeVisible();

  await page.getByLabel('RUT').fill('9.876.543-3');
  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('No tienes permiso para consultar este RUT.')).toBeVisible();
});

test('lets an administrator consult any valid RUT and fully log out', async ({ page, context }) => {
  await page.goto('/');
  await page.getByLabel('Usuario').fill('demo.admin');
  await page.getByLabel('Contraseña').fill('AdminDemo!2026');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await page.getByLabel('RUT').fill('9.876.543-3');
  await page.getByRole('button', { name: 'Consultar score' }).click();
  await expect(page.getByText('33')).toBeVisible();

  const logoutResponse = page.waitForResponse((response) => (
    response.url().endsWith('/api/auth/logout') && response.request().method() === 'POST'
  ));
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  expect((await logoutResponse).status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeVisible();
  expect((await context.cookies()).some((cookie) => cookie.name === 'crf_session')).toBe(false);

  await page.reload();
  await expect(page.getByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeVisible();
});

test('rejects and clears a forged session cookie', async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('Playwright baseURL is required');
  await context.addCookies([{
    name: 'crf_session',
    value: 'forged-token',
    url: baseURL,
    httpOnly: true,
    sameSite: 'Lax',
  }]);

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeVisible();
  expect((await context.cookies()).some((cookie) => cookie.name === 'crf_session')).toBe(false);
});
