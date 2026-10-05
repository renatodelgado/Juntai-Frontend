import { expect, test, type Page } from '@playwright/test';
const admin = {
  id: 'admin-fixture',
  nome: 'Admin Teste',
  email: 'admin@example.com',
  tipoPerfil: 'admin',
};
async function mockAdmin(page: Page) {
  let records = [
    {
      id: 'startup-fixture',
      nome: 'Startup de teste',
      email: 'startup@example.com',
      tipo: 'startup',
      status: 'pendente',
      ativo: true,
      criadoEm: '2026-10-05T12:00:00Z',
    },
    {
      id: 'mentor-fixture',
      nome: 'Mentora de teste',
      email: 'mentor@example.com',
      tipo: 'mentor',
      status: 'pendente',
      ativo: true,
      criadoEm: '2026-10-05T11:00:00Z',
    },
  ];
  const logs: Record<string, unknown>[] = [];
  await page.route('**/auth/me', (r) => r.fulfill({ json: admin }));
  await page.route('**/auth/login', (r) =>
    r.fulfill({ json: { token: 'admin-test', usuario: admin } }),
  );
  await page.route('**/admin/**', async (route) => {
    if (new URL(route.request().url()).port !== '3336') {
      await route.fallback();
      return;
    }
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/admin/', '');
    if (path === 'metricas') {
      await route.fulfill({
        json: {
          usuarios: 8,
          startups: 5,
          investidores: 3,
          mentores: 1,
          pendentes: records.filter((r) => r.status === 'pendente').length,
          reunioes: 2,
        },
      });
      return;
    }
    if (path === 'auditoria') {
      await route.fulfill({
        json: { items: logs, total: logs.length, page: 1, size: 15 },
      });
      return;
    }
    if (path === 'cadastros' || path === 'usuarios') {
      let items = records;
      const q = url.searchParams.get('q') || '';
      const status = url.searchParams.get('status') || '';
      const type = url.searchParams.get('tipo') || '';
      if (q)
        items = items.filter((r) => r.nome.includes(q) || r.email.includes(q));
      if (status) items = items.filter((r) => r.status === status);
      if (type) items = items.filter((r) => r.tipo === type);
      if (url.searchParams.get('grupo'))
        items = items.filter((r) => r.tipo !== 'startup');
      await route.fulfill({
        json: { items, total: items.length, page: 1, size: 15 },
      });
      return;
    }
    if (path.endsWith('/decisao')) {
      const id = path.split('/')[2];
      const body = route.request().postDataJSON();
      if (body.status === 'rejeitado' && !body.motivo) {
        await route.fulfill({
          status: 400,
          json: { message: 'Motivo obrigatório' },
        });
        return;
      }
      records = records.map((r) =>
        r.id === id ? { ...r, status: body.status } : r,
      );
      logs.unshift({
        id: String(logs.length + 1),
        acao:
          body.status === 'aprovado'
            ? 'aprovacao_cadastro'
            : 'rejeicao_cadastro',
        recurso: id.startsWith('startup') ? 'startup' : 'investidor',
        entidadeId: id,
        ator: 'Admin Teste',
        criadoEm: '2026-10-05T13:00:00Z',
        detalhes: {
          statusAnterior: 'pendente',
          statusNovo: body.status,
          motivo: body.motivo,
          resultado: 'sucesso',
        },
      });
      await route.fulfill({ json: { id, status: body.status } });
      return;
    }
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      const id = path.split('/')[1];
      records = records.map((r) =>
        r.id === id
          ? { ...r, nome: body.nomeFantasia || body.nome || r.nome }
          : r,
      );
      logs.unshift({
        id: String(logs.length + 1),
        acao: 'edicao_conteudo',
        recurso: 'startups',
        entidadeId: id,
        ator: 'Admin Teste',
        criadoEm: '2026-10-05T13:00:00Z',
        detalhes: { resultado: 'sucesso', alteracoes: body },
      });
      await route.fulfill({ json: { id, alterado: true } });
      return;
    }
    if (path.startsWith('cadastros/')) {
      const id = path.split('/')[2];
      const row = records.find((r) => r.id === id)!;
      await route.fulfill({
        json: {
          id,
          nomeFantasia: row.nome,
          nome: row.nome,
          descricaoCurta: 'Perfil fictício para testes administrativos',
          tituloProfissional: 'Mentora',
          bio: 'Experiência de teste',
          statusModeracao: row.status,
          segmento: 'edtech',
          cidade: 'Recife',
          estado: 'PE',
          canvasJson: { problema: 'Problema fictício' },
          usuario: { nome: 'Responsável de teste', email: row.email },
          historico: logs.filter((l) => l.entidadeId === id),
        },
      });
      return;
    }
    await route.fulfill({
      status: 404,
      json: { message: 'Rota de teste não encontrada' },
    });
  });
}
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('admin@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Senha-Teste!2026');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByText('Startup de teste', { exact: true }),
  ).toBeVisible();
}
test('admin aprova, rejeita com motivo, consulta logs e edita dados', async ({
  page,
}) => {
  await mockAdmin(page);
  await login(page);
  await page
    .getByRole('row')
    .filter({ hasText: 'Startup de teste' })
    .getByRole('button', { name: 'Visualizar' })
    .click();
  await expect(
    page.getByRole('dialog').getByText('Responsável de teste', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Startup de teste' })
    .getByRole('button', { name: 'Aprovar', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Cadastro aprovado' }),
  ).toContainText('Cadastro aprovado');
  await expect(
    page.getByRole('row').filter({ hasText: 'Startup de teste' }),
  ).toHaveCount(0);
  await page
    .getByRole('row')
    .filter({ hasText: 'Mentora de teste' })
    .getByRole('button', { name: 'Rejeitar', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirmar rejeição' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Informe o motivo da rejeição.',
  );
  await page
    .getByLabel('Motivo da rejeição')
    .fill('Dados precisam ser complementados — teste.');
  await page.getByRole('button', { name: 'Confirmar rejeição' }).click();
  await expect(
    page.getByText('Nenhum cadastro aguardando análise.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Auditoria', exact: true }).click();
  await expect(
    page.getByRole('row').filter({ hasText: 'Rejeição de cadastro' }),
  ).toBeVisible();
  await page
    .getByRole('row')
    .filter({ hasText: 'Rejeição de cadastro' })
    .getByRole('button', { name: 'Ver detalhes' })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'Dados precisam ser complementados',
  );
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();
  await page.getByRole('link', { name: 'Startups', exact: true }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Startup de teste' })
    .getByRole('button', { name: 'Editar', exact: true })
    .click();
  await page
    .getByLabel('Nome da startup', { exact: true })
    .fill('Startup atualizada');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(
    page.getByText('Startup atualizada', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Buscar', { exact: true }).fill('inexistente');
  await expect(
    page.getByText('Nenhum resultado encontrado para estes filtros.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(
    page.getByText('Startup atualizada', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Investidores', exact: true }).click();
  await expect(
    page.getByText('Mentora de teste', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Tipo', exact: true })
    .selectOption('mentor');
  await expect(
    page.getByText('Mentora de teste', { exact: true }),
  ).toBeVisible();
});
test('painel administrativo funciona no celular sem vazamento horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAdmin(page);
  await login(page);
  await expect(
    page.getByRole('heading', { name: 'Painel Administrativo' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: 'output/admin/admin-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: 'output/admin/admin-desktop.png',
    fullPage: true,
  });
});
test('perfil comum não pode navegar diretamente para admin', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'juntai:auth-session',
      JSON.stringify({
        token: 'startup-test',
        usuario: {
          id: 'startup',
          nome: 'Teste',
          email: 'teste@example.com',
          tipoPerfil: 'startup',
        },
      }),
    ),
  );
  await page.route('**/auth/me', (r) =>
    r.fulfill({
      json: {
        id: 'startup',
        nome: 'Teste',
        email: 'teste@example.com',
        tipoPerfil: 'startup',
      },
    }),
  );
  await page.route('**/auth/profile', (r) =>
    r.fulfill({
      json: {
        id: 'profile-test',
        nomeFantasia: 'Startup Teste',
        statusModeracao: 'pendente',
      },
    }),
  );
  let requests = 0;
  await page.route('**/admin/**', (r) => {
    if (new URL(r.request().url()).port === '3336') requests++;
    return r.fallback();
  });
  await page.goto('/admin/auditoria');
  await expect(page).toHaveURL(/\/startup\/inicio$/);
  expect(requests).toBe(0);
});
test('erro administrativo permite tentar novamente', async ({ page }) => {
  await mockAdmin(page);
  let fail = true;
  await page.route('**/admin/metricas', (r) =>
    fail
      ? r.fulfill({
          status: 503,
          json: { message: 'Servidor temporariamente indisponível' },
        })
      : r.fallback(),
  );
  await page.addInitScript(
    (user) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'admin-test', usuario: user }),
      ),
    admin,
  );
  await page.goto('/admin');
  await expect(page.getByRole('alert')).toContainText(
    'Servidor temporariamente indisponível',
  );
  fail = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(
    page.getByText('Startup de teste', { exact: true }),
  ).toBeVisible();
});

test('consulta reuniões com filtros e detalhes sem operações inventadas', async ({
  page,
}) => {
  await mockAdmin(page);
  await page.addInitScript(
    (user) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'admin-test', usuario: user }),
      ),
    admin,
  );
  await page.route('**/admin/reunioes?**', async (r) => {
    const p = new URL(r.request().url()).searchParams;
    const items =
      p.get('status') === 'realizada' || p.get('q') === 'inexistente'
        ? []
        : [
            {
              id: 'meeting-fixture',
              startup: 'Startup participante',
              investidor: 'Investidora participante',
              status: 'agendada',
              dataHoraAgendada: '2026-12-01T15:00:00Z',
              criadoEm: '2026-10-05T12:00:00Z',
              linkReuniao: 'https://example.com/reuniao',
              notas: 'Reunião fictícia de teste',
            },
          ];
    await r.fulfill({
      json: { items, total: items.length, page: 1, size: 15 },
    });
  });
  await page.goto('/admin/reunioes');
  await expect(
    page.getByText('Startup participante', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Visualizar', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Investidora participante',
  );
  await expect(
    page.getByRole('link', { name: 'Abrir link da reunião' }),
  ).toHaveAttribute('href', 'https://example.com/reuniao');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Status', exact: true })
    .selectOption('realizada');
  await expect(
    page.getByText('Nenhuma reunião encontrada para estes filtros.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(
    page.getByText('Startup participante', { exact: true }),
  ).toBeVisible();
});
test('paginação solicita a página correta e mantém pesquisa no servidor', async ({
  page,
}) => {
  await mockAdmin(page);
  await page.addInitScript(
    (user) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'admin-test', usuario: user }),
      ),
    admin,
  );
  const calls: string[] = [];
  await page.route('**/admin/cadastros?**', (r) => {
    const p = new URL(r.request().url()).searchParams;
    calls.push(p.toString());
    const current = Number(p.get('page') || 1);
    return r.fulfill({
      json: {
        items: [
          {
            id: 'row-' + current,
            nome: 'Startup página ' + current,
            tipo: 'startup',
            email: 'startup@example.com',
            status: 'pendente',
            criadoEm: '2026-10-05T12:00:00Z',
            ativo: true,
          },
        ],
        total: 20,
        page: current,
        size: 15,
      },
    });
  });
  await page.goto('/admin/cadastros');
  await expect(
    page.getByText('Startup página 1', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(
    page.getByText('Startup página 2', { exact: true }),
  ).toBeVisible();
  expect(
    calls.some((s) => new URLSearchParams(s).get('page') === '2'),
  ).toBeTruthy();
  await page.getByLabel('Buscar', { exact: true }).fill('startup');
  await expect(
    page.getByText('Startup página 1', { exact: true }),
  ).toBeVisible();
  expect(
    calls.some(
      (s) =>
        new URLSearchParams(s).get('q') === 'startup' &&
        new URLSearchParams(s).get('page') === '1',
    ),
  ).toBeTruthy();
});
