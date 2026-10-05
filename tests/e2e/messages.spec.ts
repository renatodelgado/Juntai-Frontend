import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/profile', (route) =>
    route.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
});

for (const role of ['startup', 'investidor'] as const) {
  test(`${role}: conversa, reunião e navegação mobile`, async ({ page }) => {
    const usuario = {
      id: 'demo-user',
      nome: 'Demo',
      email:
        role === 'startup'
          ? 'solnexo.teste.2109@example.com'
          : 'camila.investidora.2109@example.com',
      tipoPerfil: role,
    };
    await page.addInitScript(
      (user) =>
        sessionStorage.setItem(
          'juntai:auth-session',
          JSON.stringify({ token: 'demo-token', usuario: user }),
        ),
      usuario,
    );
    await page.route('**/auth/me', (route) => route.fulfill({ json: usuario }));
    await page.goto(`/${role}/mensagens`);
    await expect(
      page.getByRole('heading', { name: 'Mensagens', exact: true }),
    ).toBeVisible();
    const name = role === 'startup' ? 'Camila Torres' : 'SolNexo Energia';
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await expect(
      page.getByRole('button', { name: 'Enviar mensagem', exact: true }),
    ).toBeDisabled();
    const composer = page.getByRole('textbox', {
      name: 'Mensagem',
      exact: true,
    });
    await composer.fill('   ');
    await composer.press('Enter');
    await expect(
      page.getByRole('button', { name: 'Enviar mensagem', exact: true }),
    ).toBeDisabled();
    await composer.fill('Primeira linha');
    await composer.press('Shift+Enter');
    await composer.press('End');
    await composer.press('a');
    await expect(composer).toHaveValue('Primeira linha\na');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'pitch.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Apresentação da startup'),
    });
    await page
      .getByRole('textbox', { name: 'Mensagem', exact: true })
      .fill('Vamos construir essa parceria!');
    await page
      .getByRole('textbox', { name: 'Mensagem', exact: true })
      .press('Enter');
    await expect(
      page
        .getByRole('log')
        .getByText('Vamos construir essa parceria!', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('log').getByRole('button', { name: 'pitch.txt' }),
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: role === 'startup' ? 'Ver perfil' : 'Ver startup',
        exact: true,
      })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Perfil público da conexão' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    await page.getByRole('button', { name: 'Opções da conversa' }).click();
    await page
      .getByRole('button', { name: 'Agendar reunião', exact: true })
      .click();
    await page.getByLabel('Data', { exact: true }).fill('2027-10-15');
    await page.getByLabel('Horário', { exact: true }).fill('15:00');
    await page.getByRole('button', { name: 'Enviar convite' }).click();
    await expect(
      page.getByRole('button', { name: 'Ver reunião', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Opções da conversa' }).click();
    await page
      .getByRole('button', { name: 'Arquivar conversa', exact: true })
      .click();
    await expect(page.getByText('Esta conversa está arquivada.')).toBeVisible();
    await page
      .getByRole('button', { name: 'Reativar conversa', exact: true })
      .click();
    await page.screenshot({
      path: 'test-results/messages-' + role + '-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'test-results/messages-' + role + '-mobile.png',
      fullPage: true,
    });
    await expect(
      page.getByRole('textbox', { name: 'Mensagem', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Voltar para conversas' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Buscar conversa' }),
    ).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Buscar conversa' })
      .fill('inexistente');
    await expect(page.getByText('Nenhuma conversa encontrada')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
