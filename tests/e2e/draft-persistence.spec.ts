import { test, expect } from '@playwright/test';

for (const role of ['startup', 'investidor']) {
  test(`${role}: persiste apenas ao salvar explicitamente`, async ({
    page,
  }) => {
    await page.goto(`/cadastro/${role}`);
    const input = page.getByLabel(
      role === 'startup' ? 'Nome da startup' : 'Nome completo',
      { exact: true },
    );
    await input.fill('Sem salvar');
    await page.reload();
    await expect(input).toHaveValue('');
    await input.fill('Salvo explicitamente');
    await page
      .getByRole('button', { name: 'Salvar e continuar depois' })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'Salvo neste navegador',
    );
    await input.fill('Alteração não salva');
    await page.reload();
    await expect(input).toHaveValue('Salvo explicitamente');
  });
}

test('Canvas não salva o cadastro automaticamente e revisão permite navegação direta', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/cadastro/startup');
  await page.getByLabel('Nome da startup', { exact: true }).fill('Temporário');
  await page.getByRole('button', { name: /^7\. Pitch e Canvas/ }).click();
  await page
    .getByRole('button', { name: 'Preencher Proposta de valor' })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel(/^Proposta de valor/)
    .fill('Texto temporário');
  await page.getByRole('button', { name: 'Salvar e fechar' }).click();
  await page.getByRole('button', { name: /^8\. Revisão/ }).click();
  await expect(
    page.getByText('Texto temporário', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^1\. Sobre/ }).click();
  await page.getByRole('button', { name: /^8\. Revisão/ }).click();
  await expect(page.getByText('Temporário', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    '',
  );
  await page.getByRole('button', { name: /^7\. Pitch e Canvas/ }).click();
  await expect(
    page.getByRole('button', { name: 'Preencher Proposta de valor' }),
  ).toBeVisible();
});
