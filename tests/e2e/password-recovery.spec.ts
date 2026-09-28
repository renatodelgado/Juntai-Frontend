import { expect, test } from '@playwright/test';

test('recuperação verifica e-mail, informa ausência e não simula envio', async ({
  page,
}) => {
  await page.goto('/');
  const background = await page
    .locator('body')
    .evaluate((body) => getComputedStyle(body).backgroundColor);
  await page.getByRole('link', { name: 'Entrar', exact: true }).click();
  expect(
    await page
      .locator('body')
      .evaluate((body) => getComputedStyle(body).backgroundColor),
  ).toBe(background);
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  await expect(page).toHaveURL('/esqueci-minha-senha');
  await page.route('**/auth/forgot-password', async (route) => {
    const { email } = route.request().postDataJSON();
    if (email === 'cadastrado@example.com') {
      await route.fulfill({ json: { emailFound: true, codeSent: false } });
    } else {
      await route.fulfill({
        status: 404,
        json: { message: 'O e-mail digitado não está na nossa base de dados.' },
      });
    }
  });
  await page.getByLabel('E-mail cadastrado').fill('ausente@example.com');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'O e-mail digitado não está na nossa base de dados.',
  );
  await page.getByLabel('E-mail cadastrado').fill('CADASTRADO@example.com');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Nenhum código foi enviado.',
  );
  await page.route('**/auth/forgot-password', (route) => route.abort());
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível conectar',
  );
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('link', { name: 'Voltar para o login' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
});
