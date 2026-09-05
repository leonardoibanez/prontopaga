import { expect, test } from '@playwright/test';

test('shows the Spanish shell and a same-origin connected health status', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Un punto de partida para decisiones informadas/i })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Servicio conectado');
});
