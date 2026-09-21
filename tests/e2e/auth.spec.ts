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

for (const role of ['startup', 'investidor'] as const) {
  test(`${role}: login, perfil remoto, recarga, controle de perfil e logout`, async ({
    page,
  }) => {
    await mockAccount(page, role);
    await signIn(page);
    await expect(page).toHaveURL(`/${role}/perfil`);
    await expect(
      page.getByRole('heading', {
        name: role === 'startup' ? 'Startup de teste' : 'Investidora de teste',
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: /Sair/ })).toBeVisible();
    await page.goto(
      role === 'startup' ? '/investidor/perfil' : '/startup/perfil',
    );
    await expect(page).toHaveURL(`/${role}/perfil`);
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
      await page.evaluate(() => sessionStorage.getItem('juntai:auth-session')),
    ).toBeNull();
    await page.goto(`/${role}/perfil`);
    await expect(page).toHaveURL('/login');
  });
}

test('rotas privadas rejeitam sessão ausente ou inválida', async ({ page }) => {
  await page.goto('/startup/perfil');
  await expect(page).toHaveURL('/login');
  await page.evaluate(() =>
    sessionStorage.setItem('juntai:auth-session', '{invalid'),
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
    await page.evaluate(() => sessionStorage.getItem('juntai:auth-session')),
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
  await expect(page).toHaveURL('/startup/perfil');
  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 401,
      json: { message: 'Token inválido ou expirado.' },
    }),
  );
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page).toHaveURL('/login');
  expect(
    await page.evaluate(() => sessionStorage.getItem('juntai:auth-session')),
  ).toBeNull();
});

test('falha temporária da API permite tentar novamente sem apagar a sessão', async ({
  page,
}) => {
  await mockAccount(page, 'investidor');
  await signIn(page);
  await expect(page).toHaveURL('/investidor/perfil');
  await page.route('**/auth/me', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Não conseguimos confirmar seu acesso' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem('juntai:auth-session')),
  ).not.toBeNull();
  await page.unroute('**/auth/me');
  await mockAccount(page, 'investidor');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Investidora de teste',
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
});
