import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('shows the Spanish shell and a same-origin connected health status', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Servicio conectado');
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});
