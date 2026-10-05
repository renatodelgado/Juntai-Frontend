import { test, expect, type Page } from '@playwright/test';
const approved = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  nomeFantasia: 'Startup aprovada real',
  descricaoCurta: 'Solução aprovada para produtores rurais',
  descricaoPitch: 'Pitch informado no cadastro.',
  segmento: 'agtech',
  estagio: 'validacao',
  modeloNegocio: 'b2b',
  statusModeracao: 'aprovado',
  criadoEm: '2026-10-05T12:00:00Z',
  atualizadoEm: '2026-10-05T12:00:00Z',
  estado: 'PE',
  cidade: 'Recife',
  regioesAtuacao: ['nordeste'],
  buscaInvestimento: true,
  capitalProcurado: '150000.00',
  necessidadesAdicionais: ['mentoria'],
  numeroClientes: 0,
  faturamentoMensal: '5000.00',
  tamanhoEquipe: 4,
  apresentacaoUrl: 'https://example.com/startup-pitch.pdf',
  logoUrl: 'https://example.com/startup-logo.png',
  canvasJson: {
    problema: 'Problema do cadastro',
    solucao: 'Solução do cadastro',
    value: 'Proposta de valor cadastrada',
  },
};
async function account(page: Page) {
  await page.route(approved.logoUrl, (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#3E327F"/></svg>',
    }),
  );
  const user = {
    id: 'discovery-user',
    nome: 'Investidor de teste',
    email: 'investor@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (r) => r.fulfill({ json: user }));
  await page.route('**/startups/interesses', (r) => r.fulfill({ json: [] }));
  await page.route('**/auth/profile', (r) =>
    r.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
  await page.route('**/startups', (r) =>
    r.request().resourceType() === 'document'
      ? r.fallback()
      : r.fulfill({
          json: [
            approved,
            {
              ...approved,
              id: 'pending',
              nomeFantasia: 'Startup pendente oculta',
              statusModeracao: 'pendente',
            },
            {
              ...approved,
              id: 'rejected',
              nomeFantasia: 'Startup rejeitada oculta',
              statusModeracao: 'rejeitado',
            },
          ],
        }),
  );
}
test('Explorar usa startups aprovadas reais, filtra e abre logo, apresentação e perfil', async ({
  page,
}) => {
  await account(page);
  await page.goto('/investidor/startups');
  await expect(
    page.getByRole('heading', { name: approved.nomeFantasia, exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Startup pendente oculta')).toHaveCount(0);
  await expect(page.getByText('Startup rejeitada oculta')).toHaveCount(0);
  await expect(page.getByText('SolNexo Energia')).toHaveCount(0);
  await expect(page.locator('.card-top img')).toHaveAttribute(
    'src',
    approved.logoUrl,
  );
  const score = await page.getByText(/^\d+% compatível$/).textContent();
  await page
    .getByRole('combobox', { name: 'Todos os segmentos' })
    .selectOption('Agtech');
  await expect(
    page.getByRole('heading', { name: approved.nomeFantasia, exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Salvar ' + approved.nomeFantasia,
      exact: true,
    })
    .click();
  await page.getByRole('link', { name: 'Ver startup' }).click();
  await expect(page).toHaveURL(new RegExp('/startups/' + approved.id + '$'));
  await expect(
    page.getByText('Problema do cadastro', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Solução do cadastro', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Abrir apresentação' }),
  ).toHaveAttribute('href', approved.apresentacaoUrl);
  await expect(page.getByText(/^\d+% compatível$/)).toHaveText(score!);
  await page.getByText('Canvas', { exact: true }).click();
  await expect(
    page.getByText('Proposta de valor cadastrada', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Voltar à exploração' }).click();
  await expect(
    page.getByRole('button', {
      name: 'Remover ' + approved.nomeFantasia,
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('searchbox', { name: 'Buscar startups' })
    .fill('inexistente');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma startup encontrada' }),
  ).toBeVisible();
});
test('sem aprovações a lista fica vazia; falha da API permite tentar novamente', async ({
  page,
}) => {
  await account(page);
  let fail = true;
  await page.route('**/startups', (r) =>
    r.request().resourceType() === 'document'
      ? r.fallback()
      : r.fulfill(
          fail
            ? { status: 503, json: { message: 'Falha de teste' } }
            : { json: [] },
        ),
  );
  await page.goto('/investidor/startups');
  await expect(
    page.getByRole('heading', {
      name: 'Não foi possível carregar as startups',
    }),
  ).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(
    page.getByRole('heading', { name: 'Nenhuma startup encontrada' }),
  ).toBeVisible();
  await expect(page.getByText('SolNexo Energia')).toHaveCount(0);
});

test('interesse persistido abre primeira conversa e mantém o match após recarregar', async ({
  page,
}) => {
  await account(page);
  const recipient = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const interest = {
    startupId: approved.id,
    startupName: approved.nomeFantasia,
    usuarioId: recipient,
    createdAt: new Date().toISOString(),
  };
  let confirmed = false;
  let fail = true;
  const history: {
    id: string;
    conversaId: string;
    conteudo: string;
    enviadoEm: string;
    lidoEm: null;
    remetenteId: string;
  }[] = [];
  await page.route('**/startups/interesses', (r) =>
    r.fulfill({ json: confirmed ? [interest] : [] }),
  );
  await page.route(`**/startups/${approved.id}/interesse`, async (r) => {
    expect(r.request().method()).toBe('POST');
    if (fail)
      return r.fulfill({
        status: 503,
        json: { message: 'Falha ao confirmar interesse' },
      });
    confirmed = true;
    return r.fulfill({ json: interest });
  });
  await page.route('**/mensagens/conversas', (r) =>
    r.fulfill({
      json: history.length
        ? [
            {
              conversaId: 'conversation',
              usuarioId: recipient,
              nome: approved.nomeFantasia,
              tipoPerfil: 'startup',
              ultimaMensagem: history.at(-1)!.conteudo,
              ultimaMensagemEm: history.at(-1)!.enviadoEm,
              enviadaPorMim: true,
              naoLidas: 0,
            },
          ]
        : [],
    }),
  );
  await page.route(`**/mensagens/${recipient}`, (r) =>
    r.fulfill({ json: history }),
  );
  await page.route('**/mensagens', async (r) => {
    if (r.request().method() !== 'POST') return r.fallback();
    const body = r.request().postDataJSON();
    expect(body.destinatarioId).toBe(recipient);
    const message = {
      id: '1',
      conversaId: 'conversation',
      conteudo: body.conteudo,
      enviadoEm: new Date().toISOString(),
      lidoEm: null,
      remetenteId: 'discovery-user',
    };
    history.push(message);
    return r.fulfill({ status: 201, json: message });
  });
  await page.goto('/investidor/startups');
  await page
    .getByRole('button', { name: 'Tenho interesse', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Confirmar interesse', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Falha ao confirmar interesse',
  );
  expect(confirmed).toBe(false);
  fail = false;
  await page
    .getByRole('button', { name: 'Confirmar interesse', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Iniciar conversa', exact: true })
    .click();
  await expect(page).toHaveURL(
    new RegExp('/investidor/mensagens\\?startup=' + approved.id),
  );
  await expect(
    page.getByText('Envie a primeira mensagem para iniciar a conversa.'),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Mensagem', exact: true })
    .fill('Quero conhecer sua startup');
  await page
    .getByRole('button', { name: 'Enviar mensagem', exact: true })
    .click();
  await expect(
    page.getByRole('article').filter({ hasText: 'Quero conhecer sua startup' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('article').filter({ hasText: 'Quero conhecer sua startup' }),
  ).toBeVisible();
  await page.goto('/investidor/matches');
  await expect(
    page
      .getByRole('heading', { name: approved.nomeFantasia, exact: true })
      .first(),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Iniciar conversa', exact: true })
    .first()
    .click();
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: 'Iniciar conversa', exact: true }),
  ).toBeVisible();
});
