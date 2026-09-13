import { test, expect, type Page } from '@playwright/test';

const next = async (page: Page) =>
  page.getByRole('button', { name: 'Continuar', exact: true }).click();
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/localidades/estados/PE/municipios?*', (route) =>
    route.fulfill({ json: [{ id: 2611606, nome: 'Recife' }] }),
  );
});

for (const role of ['Mentor', 'Investidor + mentor']) {
  test(`cadastro na API de ${role}`, async ({ page }) => {
    const mentor = role === 'Mentor';
    let requests = 0;
    await page.route('**/investidores', async (route) => {
      requests++;
      expect(route.request().method()).toBe('POST');
      const body = route.request().postDataJSON();
      expect(body.tipoInvestidor).toBe(mentor ? 'mentor' : 'anjo_mentor');
      expect(body.regioesInteresse).toEqual(['nordeste']);
      expect(body.estagiosInteresse).toEqual(['mvp']);
      if (mentor) expect(body).not.toHaveProperty('ticketMinimo');
      if (requests === 1)
        await route.fulfill({
          status: 400,
          json: { message: 'E-mail já cadastrado.' },
        });
      else
        await route.fulfill({
          status: 201,
          json: { id: 'investor-id', statusModeracao: 'pendente' },
        });
    });
    await page.goto('/cadastro/investidor');
    await next(page);
    await expect(page.getByText('Campo obrigatório').first()).toBeVisible();
    await page
      .getByLabel('Nome completo', { exact: true })
      .fill('Ana do Recife');
    await page.getByLabel('Estado', { exact: true }).selectOption('PE');
    await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
    await expect(page.getByRole('status')).toHaveText('Salvo neste navegador.');
    await page.reload();
    await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
      'Ana do Recife',
    );
    await page.screenshot({
      path: `test-results/investor-${mentor ? 'mentor' : 'both'}-desktop.png`,
      fullPage: true,
    });
    await next(page);
    await page
      .getByRole('radio', { name: new RegExp(`^${role.replace('+', '\\+')}`) })
      .check();
    await next(page);
    await page.getByRole('checkbox', { name: 'Fintech', exact: true }).check();
    await next(page);
    await page.getByRole('checkbox', { name: /^MVP/ }).check();
    await next(page);
    if (mentor) {
      await expect(
        page.getByText('Você escolheu participar como mentor.', {
          exact: false,
        }),
      ).toBeVisible();
    } else {
      await page
        .getByLabel('Qual é o menor valor que você costuma investir?', {
          exact: true,
        })
        .fill('50000');
      await page
        .getByLabel('Qual é o maior valor que você costuma investir?', {
          exact: true,
        })
        .fill('10000');
      await next(page);
      await expect(
        page.getByText('O máximo deve ser igual ou maior que o mínimo'),
      ).toBeVisible();
      await page
        .getByLabel('Qual é o maior valor que você costuma investir?', {
          exact: true,
        })
        .fill('500000');
    }
    await next(page);
    await page.getByRole('checkbox', { name: 'B2B', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Nordeste', exact: true }).check();
    await next(page);
    if (!mentor)
      await page.getByRole('radio', { name: 'Moderado', exact: true }).check();
    await page
      .getByRole('checkbox', { name: 'Tecnologia', exact: true })
      .check();
    await next(page);
    await page.getByRole('radio', { name: 'Não', exact: true }).check();
    await next(page);
    await page
      .getByRole('radio', { name: 'Semanalmente', exact: true })
      .check();
    await page
      .getByRole('checkbox', { name: 'Conversas online', exact: true })
      .check();
    await page
      .getByRole('group', { name: 'Você aceita mentorias?' })
      .getByRole('radio', { name: 'Sim', exact: true })
      .check();
    if (!mentor)
      await page
        .getByRole('group', {
          name: 'Você está aberto a novos investimentos neste momento?',
        })
        .getByRole('radio', { name: 'Talvez', exact: true })
        .check();
    await next(page);
    await page.getByRole('checkbox', { name: /^Mentoria/ }).check();
    await next(page);
    await next(page);
    await next(page);
    await page
      .getByRole('button', { name: 'Termos de Uso', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#termsAccepted').check();
    await page.locator('#privacyAcknowledged').check();
    const email = mentor ? 'mentor@example.com' : 'investor@example.com';
    await page.getByLabel('E-mail de acesso').fill(email);
    await page.getByLabel('Crie uma senha').fill('Teste-local-123');
    await page.getByLabel('Confirme a senha').fill('Teste-local-123');
    await page
      .getByRole('button', { name: 'Finalizar cadastro', exact: true })
      .click();
    await expect(page.getByRole('alert')).toContainText('E-mail já cadastrado');
    await expect(page.getByLabel('E-mail de acesso')).toHaveValue(email);
    await page.getByLabel('E-mail de acesso').fill('outro@example.com');
    await page
      .getByRole('button', { name: 'Finalizar cadastro', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Perfil enviado!' }),
    ).toBeVisible();
    expect(requests).toBe(2);
    await page.getByRole('link', { name: 'Voltar ao início' }).click();
    await expect(page).toHaveURL('/');
  });
}
