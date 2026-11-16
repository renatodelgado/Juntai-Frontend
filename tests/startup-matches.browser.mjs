import { chromium } from 'playwright';
import { preview } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server = await preview({
  preview: { host: '127.0.0.1', port: 5201, strictPort: true },
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
const user = {
  id: 'startup-user',
  nome: 'Aurora',
  email: 'test@example.com',
  tipoPerfil: 'startup',
};
const base = {
  avatarUrl: null,
  tituloProfissional: 'Estratégia de negócios',
  bio: 'Apoio startups a crescer com experiência e conexões.',
  cidade: 'Fortaleza',
  estado: 'CE',
  linkedinUrl: 'https://www.linkedin.com/in/example',
  descricaoExperiencia: 'Experiência com crescimento e produto.',
  anosExperiencia: 8,
  areasAjuda: ['networking'],
  segmentosInteresse: ['fintech'],
  estagiosInteresse: ['mvp'],
  conversaId: null,
  conversaIniciada: false,
  podeAvaliarConversa: false,
  reuniaoAgendadaId: null,
  reuniaoAgendadaEm: null,
  reunioesAgendadas: 0,
  reuniaoRealizadaId: null,
  situacao: 'novo_interesse',
};
const people = [
  {
    ...base,
    investidorId: 'a',
    usuarioId: 'inv-a',
    nome: 'Camila Silva',
    tipoInvestidor: 'mentor',
    interessadoEm: '2026-11-16T12:00:00Z',
  },
  {
    ...base,
    investidorId: 'b',
    usuarioId: 'inv-b',
    nome: 'Bruno Costa',
    tipoInvestidor: 'anjo',
    interessadoEm: '2026-11-15T12:00:00Z',
    conversaId: 'conv-b',
    conversaIniciada: true,
    podeAvaliarConversa: true,
    reuniaoAgendadaId: '10',
    reuniaoAgendadaEm: '2026-11-20T12:00:00Z',
    reunioesAgendadas: 2,
    reuniaoRealizadaId: '9',
    situacao: 'reuniao_agendada',
  },
  {
    ...base,
    investidorId: 'c',
    usuarioId: 'inv-c',
    nome: 'Ana Lima',
    tipoInvestidor: 'anjo_mentor',
    interessadoEm: '2026-11-14T12:00:00Z',
    conversaId: 'conv-c',
    conversaIniciada: true,
    podeAvaliarConversa: true,
    reuniaoRealizadaId: '8',
    situacao: 'em_acompanhamento',
  },
];
let fail = true,
  empty = false;
const errors = [];
async function session(role = 'startup', approved = true) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const actor = { ...user, tipoPerfil: role };
  await context.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    actor,
  );
  await context.route(
    /https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,
    (r) => r.abort(),
  );
  await context.route(
    /https?:\/\/(localhost|127\.0\.0\.1):3333\//,
    async (route) => {
      const req = route.request(),
        path = new URL(req.url()).pathname;
      const json = (data) => route.fulfill({ json: data });
      if (path === '/auth/me') return json(actor);
      if (path === '/auth/profile')
        return json({ statusModeracao: approved ? 'aprovado' : 'pendente' });
      if (path === '/avaliacoes/pendentes') return json([]);
      if (path === '/startups/interessados') {
        if (fail) {
          fail = false;
          return route.fulfill({
            status: 503,
            json: { message: 'Não foi possível consultar agora.' },
          });
        }
        return json({
          items: empty ? [] : people,
          resumo: empty
            ? { interessados: 0, conversasIniciadas: 0, reunioesAgendadas: 0 }
            : { interessados: 3, conversasIniciadas: 2, reunioesAgendadas: 2 },
        });
      }
      if (path === '/reunioes')
        return json([
          {
            id: '10',
            startupId: 's',
            startupNome: 'Aurora',
            investidorId: 'b',
            investidorNome: 'Bruno Costa',
            dataHoraAgendada: '2026-11-20T12:00:00Z',
            status: 'agendada',
            linkReuniao: null,
            notas: 'Encontro com Bruno',
            criadoEm: '2026-11-15T12:00:00Z',
          },
        ]);
      if (path === '/mensagens/conversas')
        return json([
          {
            conversaId: 'conv-b',
            usuarioId: 'inv-b',
            nome: 'Bruno Costa',
            tipoPerfil: 'investidor',
            avatarUrl: null,
            ultimaMensagem: 'Olá',
            ultimaMensagemEm: '2026-11-15T12:00:00Z',
            enviadaPorMim: false,
            naoLidas: 0,
          },
        ]);
      if (path === '/mensagens/inv-b') return json([]);
      if (path.startsWith('/avaliacoes/'))
        return json({
          elegivel: true,
          nome: 'Bruno Costa',
          avaliacao: null,
          investimentoInformadoPeloOutro: false,
          investimentoConfirmado: false,
        });
      if (path === '/startups/interesses') return json([]);
      return route.fulfill({ status: 404, json: {} });
    },
  );
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', (e) => errors.push(e.message));
  return { context, page };
}
let last;
try {
  await mkdir('output/startup-matches', { recursive: true });
  const { page, context } = await session();
  last = page;
  await page.goto('http://127.0.0.1:5201/startup/matches');
  await page
    .getByRole('heading', { name: 'Não foi possível carregar os interessados' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'Camila Silva', exact: true })
    .waitFor();
  assert.equal(await page.locator('article').count(), 3);
  assert.deepEqual(
    await page
      .getByRole('region', { name: 'Resumo das conexões' })
      .locator('strong')
      .allTextContents(),
    ['3', '2', '2'],
  );
  assert.equal(
    await page
      .getByRole('link', { name: 'Matches', exact: true })
      .getAttribute('aria-current'),
    'page',
  );
  const camila = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Camila Silva', exact: true }),
  });
  assert.equal(
    await camila
      .getByRole('link', { name: 'Abrir conversa', exact: true })
      .count(),
    0,
  );
  await camila
    .getByText('Interesse recebido. Aguardando a primeira mensagem.')
    .waitFor();
  await page
    .getByRole('button', { name: 'Ver perfil de Camila Silva' })
    .click();
  const profile = page.getByRole('dialog', { name: 'Perfil do interessado' });
  await profile.getByText('Experiência com crescimento e produto.').waitFor();
  assert.equal(
    await profile
      .getByRole('link', { name: 'Ver LinkedIn' })
      .getAttribute('rel'),
    'noopener noreferrer',
  );
  await profile.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Atuação', exact: true })
    .selectOption('mentor');
  assert.equal(await page.locator('article').count(), 2);
  await page
    .getByRole('combobox', { name: 'Situação', exact: true })
    .selectOption('em_acompanhamento');
  assert.equal(await page.locator('article').count(), 1);
  await page.getByRole('searchbox').fill('inexistente');
  await page
    .getByRole('heading', { name: 'Nenhum interessado encontrado' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Ordenar por' })
    .selectOption('nome');
  assert.deepEqual(await page.locator('article h2').allTextContents(), [
    'Ana Lima',
    'Bruno Costa',
    'Camila Silva',
  ]);
  await page.screenshot({ path: 'output/startup-matches/desktop.png' });
  const bruno = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Bruno Costa', exact: true }),
  });
  await bruno
    .getByRole('button', { name: 'Avaliar interação', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Avaliar interação' })
    .getByRole('combobox', { name: 'Há perspectiva de investimento?' })
    .waitFor();
  await page
    .getByRole('dialog', { name: 'Avaliar interação' })
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();
  await bruno.getByRole('link', { name: 'Ver reunião' }).click();
  await page
    .getByRole('dialog', { name: 'Detalhes da reunião' })
    .getByText('Encontro com Bruno')
    .waitFor();
  assert.ok(page.url().includes('reuniao=10'));
  await page.goto('http://127.0.0.1:5201/startup/matches');
  await page
    .getByRole('heading', { name: 'Bruno Costa', exact: true })
    .waitFor();
  await page
    .locator('article')
    .filter({
      has: page.getByRole('heading', { name: 'Bruno Costa', exact: true }),
    })
    .getByRole('link', { name: 'Abrir conversa' })
    .click();
  await page.waitForURL('**/startup/mensagens?usuario=inv-b');
  await page
    .getByRole('heading', { name: 'Bruno Costa', exact: true })
    .waitFor();
  await page.goto('http://127.0.0.1:5201/startup/matches');
  await page
    .getByRole('heading', { name: 'Camila Silva', exact: true })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'output/startup-matches/mobile.png',
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  empty = true;
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Suas próximas conexões começam aqui' })
    .waitFor();
  assert.equal(
    await page
      .getByRole('link', { name: 'Revisar meu perfil' })
      .getAttribute('href'),
    '/startup/perfil',
  );
  await context.close();
  const pending = await session('startup', false);
  last = pending.page;
  await pending.page.goto('http://127.0.0.1:5201/startup/matches');
  await pending.page.waitForURL('**/startup/inicio');
  await pending.context.close();
  assert.deepEqual(errors, []);
  console.log(
    'PASS startup matches: real navigation, retry, counters, public profile, type/status/search/sort, empty state, chat, meeting deep link, feedback, mobile and approval guard',
  );
} catch (e) {
  if (last && !last.isClosed())
    await last.screenshot({ path: 'output/startup-matches/failure.png' });
  throw e;
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
