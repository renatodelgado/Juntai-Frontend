import { expect, test, type Page } from '@playwright/test';

async function mockAccount(page: Page, role: 'startup' | 'investidor') {
  const usuario = {
    id: `user-${role}`,
    nome: 'Pessoa de teste',
    email: 'conta@example.com',
    tipoPerfil: role,
  };
  await page.route('**/auth/login', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: usuario.email,
      senha: 'Senha-teste-123',
    });
    await route.fulfill({ json: { token: 'test-token', usuario } });
  });
  await page.route('**/auth/me', async (route) => {
    expect(route.request().headers().authorization).toBe('Bearer test-token');
    await route.fulfill({ json: usuario });
  });
  await page.route('**/auth/profile', async (route) => {
    expect(route.request().headers().authorization).toBe('Bearer test-token');
    await route.fulfill({
      json: {
        id: 'profile-id',
        atualizadoEm: '2026-09-21T12:00:00Z',
        statusModeracao: 'pendente',
        ...(role === 'startup'
          ? {
              nomeFantasia: 'Startup de teste',
              segmento: 'fintech',
              estagio: 'mvp',
              regiao: 'recife',
              modeloNegocio: 'b2b',
              capitalProcurado: '250000.00',
            }
          : {
              nome: 'Investidora de teste',
              tipoInvestidor: 'anjo_mentor',
              ticketMinimo: '10000.00',
              ticketMaximo: '50000.00',
              segmentosInteresse: ['fintech'],
              estagiosInteresse: ['mvp'],
              regioesInteresse: ['nordeste'],
              modelosInteresse: ['b2b'],
            }),
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('conta@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Senha-teste-123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

test('edição localizada salva apenas o parceiro ou um bloco do Canvas', async ({
  page,
}) => {
  await mockAccount(page, 'startup');
  await signIn(page);
  await expect(
    page.getByRole('heading', { name: 'Seu perfil está em avaliação' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Meu perfil', exact: true }).click();
  await page
    .getByRole('button', { name: 'Editar Tipo de parceiro', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('heading', {
      name: 'Editar Tipo de parceiro',
      exact: true,
    }),
  ).toBeVisible();
  await expect(dialog.getByLabel('Quanto pretendem captar?')).toHaveCount(0);
  await dialog.getByRole('radio', { name: 'Mentor', exact: true }).check();
  await dialog
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await page
    .getByRole('button', { name: 'Editar Tipo de parceiro', exact: true })
    .click();
  await expect(
    dialog.getByRole('radio', { name: 'Mentor', exact: true }),
  ).toBeChecked();
  await dialog
    .getByRole('radio', { name: 'Investidor anjo', exact: true })
    .check();
  await dialog
    .getByRole('button', { name: 'Cancelar / fechar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Editar Tipo de parceiro', exact: true })
    .click();
  await expect(
    dialog.getByRole('radio', { name: 'Mentor', exact: true }),
  ).toBeChecked();
  await dialog
    .getByRole('button', { name: 'Cancelar / fechar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Preencher Proposta de valor', exact: true })
    .click();
  await expect(dialog.getByRole('textbox')).toHaveCount(1);
  await dialog
    .getByLabel(/^Proposta de valor/)
    .fill('Uma proposta de valor salva isoladamente.');
  await dialog
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Editar Proposta de valor', exact: true }),
  ).toContainText('Uma proposta de valor salva isoladamente.');
  await expect(
    page.getByRole('button', {
      name: 'Preencher Parcerias principais',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText('R$ 250.000,00', { exact: true })).toBeVisible();
  await page.screenshot({
    path: 'test-results/canvas-localized-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('sessão persiste em nova aba, redireciona a home pública e sincroniza logout', async ({
  page,
  context,
}) => {
  await mockAccount(page, 'startup');
  await signIn(page);
  await expect(page).toHaveURL('/startup/inicio');
  const other = await context.newPage();
  await mockAccount(other, 'startup');
  await other.goto('/');
  await expect(other).toHaveURL('/startup/inicio');
  await other.goto('/login');
  await expect(other).toHaveURL('/startup/inicio');
  await page
    .getByRole('button', { name: 'Sair da conta', exact: true })
    .click();
  await expect(other).toHaveURL('/login');
  await other.goto('/');
  await expect(
    other.getByRole('link', { name: 'Tenho uma startup', exact: true }),
  ).toBeVisible();
});

test('token expira enquanto o painel está aberto', async ({ page }) => {
  await page.clock.install();
  const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 120 })).toString('base64url')}.signature`;
  await mockAccount(page, 'startup');
  const usuario = {
    id: 'user-startup',
    nome: 'Teste',
    email: 'conta@example.com',
    tipoPerfil: 'startup',
  };
  await page.route('**/auth/login', (route) =>
    route.fulfill({ json: { token, usuario } }),
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: usuario }));
  await page.route('**/auth/profile', (route) =>
    route.fulfill({
      json: {
        id: 'profile',
        atualizadoEm: '2026-09-28T12:00:00Z',
        statusModeracao: 'pendente',
        nomeFantasia: 'Teste',
        segmento: 'fintech',
        estagio: 'mvp',
        regiao: 'recife',
        modeloNegocio: 'b2b',
      },
    }),
  );
  await signIn(page);
  await expect(page).toHaveURL('/startup/inicio');
  await page.clock.fastForward(121_000);
  await expect(page).toHaveURL('/login');
  expect(
    await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
  ).toBeNull();
});

test('moderação aprovada e suspensa não inventa recomendações', async ({
  page,
}) => {
  await mockAccount(page, 'investidor');
  let statusModeracao = 'aprovado';
  await page.route('**/auth/profile', (route) =>
    route.fulfill({
      json: {
        id: 'profile',
        atualizadoEm: '2026-09-28T12:00:00Z',
        statusModeracao,
        nome: 'Mentora',
        tipoInvestidor: 'mentor',
        segmentosInteresse: ['fintech'],
        estagiosInteresse: ['mvp'],
        regioesInteresse: ['nordeste'],
        modelosInteresse: ['b2b'],
      },
    }),
  );
  await signIn(page);
  await expect(
    page.getByRole('heading', { name: 'Seu perfil está aprovado' }),
  ).toBeVisible();
  await expect(
    page.getByText('Estamos preparando suas recomendações'),
  ).toBeVisible();
  await expect(
    page.getByText('Faixa de investimento', { exact: true }),
  ).toHaveCount(0);
  statusModeracao = 'suspenso';
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Seu perfil está suspenso' }),
  ).toBeVisible();
  await expect(
    page.getByText('Conexões indisponíveis no momento'),
  ).toBeVisible();
});

for (const role of ['startup', 'investidor'] as const) {
  test(`${role}: login, perfil remoto, recarga, controle de perfil e logout`, async ({
    page,
  }) => {
    await mockAccount(page, role);
    await signIn(page);
    await expect(page).toHaveURL(`/${role}/inicio`);
    await expect(
      page.getByRole('heading', { name: 'Seu perfil está em avaliação' }),
    ).toBeVisible();
    if (role === 'startup') {
      const completion = page.getByRole('progressbar', {
        name: 'Completude dos dados cadastrados',
      });
      expect(Number(await completion.getAttribute('value'))).toBeLessThan(100);
      await page
        .getByRole('link', { name: 'Completar Canvas', exact: true })
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page
        .getByRole('button', { name: 'Cancelar / fechar', exact: true })
        .click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await page.getByRole('link', { name: 'Início', exact: true }).click();
    }
    await page.getByRole('link', { name: 'Meu perfil', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: role === 'startup' ? 'Startup de teste' : 'Investidora de teste',
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/profile-${role}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `test-results/profile-${role}-mobile.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('link', { name: 'Início', exact: true }).click();
    await expect(page).toHaveURL(`/${role}/inicio`);
    await page.reload();
    await expect(page.getByRole('button', { name: /Sair/ })).toBeVisible();
    await page.goto(
      role === 'startup' ? '/investidor/perfil' : '/startup/perfil',
    );
    await expect(page).toHaveURL(`/${role}/inicio`);
    await page.screenshot({
      path: `test-results/auth-${role}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `test-results/auth-${role}-mobile.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: /Sair/ }).click();
    await expect(page).toHaveURL('/login');
    expect(
      await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
    ).toBeNull();
    await page.goto(`/${role}/perfil`);
    await expect(page).toHaveURL('/login');
  });
}

test('rotas privadas rejeitam sessão ausente ou inválida', async ({ page }) => {
  await page.goto('/startup/perfil');
  await expect(page).toHaveURL('/login');
  await page.evaluate(() =>
    localStorage.setItem('juntai:auth-session', '{invalid'),
  );
  await page.goto('/investidor/perfil');
  await expect(page).toHaveURL('/login');
});

test('senha incorreta e erro de conexão aparecem no login', async ({
  page,
}) => {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status: 401,
      json: { message: 'E-mail ou senha inválidos.' },
    }),
  );
  await signIn(page);
  await expect(page.getByRole('alert')).toHaveText(
    'E-mail ou senha inválidos.',
  );
  expect(
    await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
  ).toBeNull();
  await page.route('**/auth/login', (route) => route.abort());
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível conectar',
  );
});

test('sessão revogada ou expirada volta para o login', async ({ page }) => {
  await mockAccount(page, 'startup');
  await signIn(page);
  await expect(page).toHaveURL('/startup/inicio');
  await expect(
    page.getByRole('heading', { name: 'Seu perfil está em avaliação' }),
  ).toBeVisible();
  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 401,
      json: { message: 'Token inválido ou expirado.' },
    }),
  );
  const revoked = page.waitForResponse(
    (response) =>
      response.url().endsWith('/auth/me') && response.status() === 401,
  );
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await revoked;
  await expect(page).toHaveURL('/login');
  expect(
    await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
  ).toBeNull();
});

test('falha temporária da API permite tentar novamente sem apagar a sessão', async ({
  page,
}) => {
  await mockAccount(page, 'investidor');
  await signIn(page);
  await expect(page).toHaveURL('/investidor/inicio');
  await page.route('**/auth/me', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Não conseguimos confirmar seu acesso' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
  ).not.toBeNull();
  await page.unroute('**/auth/me');
  await mockAccount(page, 'investidor');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Olá, Investidora de teste! 👋',
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
});
