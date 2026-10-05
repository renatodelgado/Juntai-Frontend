import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/profile', (route) =>
    route.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
});

test('discovery, saved state, interest, meetings and contextual messaging', async ({
  page,
}) => {
  const user = {
    id: 'explore-camila',
    nome: 'Camila Torres',
    email: 'camila.investidora.2109@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript((usuario) => {
    localStorage.setItem(
      'juntai:auth-session',
      JSON.stringify({ token: 'demo-token', usuario }),
    );
  }, user);
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  await page.goto('/investidor/startups');
  await expect(
    page
      .getByRole('navigation', { name: 'Navegação do perfil' })
      .getByRole('link', { name: 'Explorar', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }),
  ).toContainText('Explorar');
  await expect(page.getByText('Dados mock', { exact: true })).toHaveCount(0);
  await expect(page.locator('img.brand-symbol')).toHaveAttribute(
    'src',
    /logo-symb|data:image\/svg\+xml/,
  );
  await expect(
    page.getByRole('heading', { name: 'Explorar startups', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'SolNexo Energia', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Salvar SolNexo Energia', exact: true })
    .click();
  await page.getByRole('searchbox', { name: 'Buscar startups' }).fill('solar');
  await expect(
    page.getByRole('heading', { name: 'AgroPonte Digital', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('link', { name: 'Ver startup' }).click();
  await expect(page).toHaveURL(/\/startups\/solnexo$/);
  await expect(
    page.getByRole('heading', { name: 'SolNexo Energia', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Tenho interesse', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirmar interesse' }).click();
  await expect(
    page.getByRole('button', { name: 'Interesse enviado', exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Interesse enviado', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  await page.getByLabel('Data', { exact: true }).fill('2027-10-15');
  await page.getByLabel('Horário', { exact: true }).fill('15:00');
  await page
    .getByRole('button', { name: 'Enviar convite', exact: true })
    .click();
  await page.getByRole('link', { name: 'Reuniões', exact: true }).click();
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await expect(
    page
      .getByRole('article', { name: 'Conversa com SolNexo Energia' })
      .getByText('Aguardando confirmação', { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Voltar à exploração' }).click();
  await expect(
    page.getByRole('searchbox', { name: 'Buscar startups' }),
  ).toHaveValue('solar');
  await expect(
    page.getByRole('button', { name: 'Remover SolNexo Energia', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('searchbox', { name: 'Buscar startups' })
    .fill('inexistente');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma startup encontrada' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .last()
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(
    page.getByRole('searchbox', { name: 'Buscar startups' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/explore-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const solnexo = await page
    .getByRole('heading', { name: 'SolNexo Energia', exact: true })
    .boundingBox();
  const agroponte = await page
    .getByRole('heading', { name: 'AgroPonte Digital', exact: true })
    .boundingBox();
  expect(agroponte!.x).toBeGreaterThan(solnexo!.x);
  await page.screenshot({
    path: 'test-results/explore-desktop.png',
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Ver startup' }).first().click();
  await page
    .getByRole('link', { name: 'Enviar mensagem', exact: true })
    .click();
  await expect(
    page.getByRole('textbox', { name: 'Mensagem', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/mensagens\?startup=solnexo/);
});

test('incomplete preferences still allow exploration without false compatibility or connection', async ({
  page,
}) => {
  const user = {
    id: 'new-investor',
    nome: 'Novo mentor',
    email: 'new@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'demo-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  await page.goto('/investidor/startups');
  await expect(
    page.getByRole('heading', { name: 'Personalize suas recomendações' }),
  ).toBeVisible();
  await expect(
    page.getByText('Compatibilidade indisponível', { exact: true }),
  ).toHaveCount(2);
  await page.getByRole('link', { name: 'Ver startup' }).first().click();
  await expect(
    page.getByRole('button', { name: 'Agendar reunião', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('link', { name: 'Enviar mensagem', exact: true }),
  ).toHaveCount(0);
});
