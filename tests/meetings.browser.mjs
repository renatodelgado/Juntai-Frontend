import { chromium } from 'playwright';
import { preview } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const server = await preview({
  preview: { host: '127.0.0.1', port: 5198, strictPort: true },
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
const origin = 'http://127.0.0.1:5198';
const startup = {
  id: 'startup-profile',
  nomeFantasia: 'Aurora Tecnologia',
  segmento: 'fintech',
  estagio: 'mvp',
  modeloNegocio: 'b2b',
  statusModeracao: 'aprovado',
  atualizadoEm: '2026-11-01',
  criadoEm: '2026-11-01',
};
const interest = {
  startupId: startup.id,
  startupName: startup.nomeFantasia,
  usuarioId: 'startup-user',
  createdAt: '2026-11-01',
};
const future = new Date(Date.now() + 86400000 * 2);
const date = new Date(future.getTime() - 3 * 3600000)
  .toISOString()
  .slice(0, 10);
let meetings = [];
let failList = true;
let failCreate = true;
let failStatus = true;
let submitted;
let creates = 0;
const errors = [];
let lastPage;

async function session(role) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.route(
    /https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//,
    (route) => route.abort(),
  );
  const user = {
    id: role === 'startup' ? 'startup-user' : 'investor-user',
    nome: 'Conta teste',
    email: 'test@example.com',
    tipoPerfil: role,
  };
  await context.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    user,
  );
  await context.route(
    /https?:\/\/(localhost|127\.0\.0\.1):3333\//,
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const json = (data) => route.fulfill({ json: data });
      const failure = (message) =>
        route.fulfill({ status: 503, json: { message } });
      if (path === '/auth/me') return json(user);
      if (path === '/auth/profile')
        return json({ statusModeracao: 'aprovado' });
      if (path === '/startups') return json([startup]);
      if (path === '/startups/interesses') return json([interest]);
      if (path === `/startups/${startup.id}`) return json(startup);
      if (path === '/mensagens/conversas')
        return json([
          {
            conversaId: 'conversation',
            usuarioId: 'startup-user',
            nome: startup.nomeFantasia,
            tipoPerfil: 'startup',
            ultimaMensagem: 'Olá',
            ultimaMensagemEm: '2026-11-01T12:00:00Z',
            enviadaPorMim: true,
            naoLidas: 0,
          },
        ]);
      if (path === '/mensagens/startup-user') return json([]);
      if (path === '/reunioes' && request.method() === 'GET') {
        if (failList) {
          return failure('Agenda indisponível');
        }
        return json(meetings);
      }
      if (path === '/reunioes' && request.method() === 'POST') {
        creates++;
        submitted = request.postDataJSON();
        if (failCreate) {
          failCreate = false;
          return failure('Não foi possível salvar agora.');
        }
        const item = {
          ...submitted,
          id: String(meetings.length + 1),
          startupNome: startup.nomeFantasia,
          investidorId: 'investor-profile',
          investidorNome: 'Investidor Teste',
          status: 'agendada',
          linkReuniao: submitted.linkReuniao ?? null,
          notas: submitted.notas ?? null,
          criadoEm: new Date().toISOString(),
        };
        meetings.push(item);
        return json(item);
      }
      if (/\/reunioes\/\d+\/status/.test(path)) {
        if (failStatus) {
          failStatus = false;
          return failure('Tente atualizar novamente.');
        }
        const item = meetings.find((item) => item.id === path.split('/')[2]);
        item.status = request.postDataJSON().status;
        return json(item);
      }
      return route.fulfill({ status: 404, json: {} });
    },
  );
  const page = await context.newPage();
  lastPage = page;
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(120000);
  page.on('pageerror', (error) => errors.push(error.message));
  return { page, context };
}
async function fill(dialog) {
  await dialog.locator('[name="date"]').fill(date);
  await dialog.locator('[name="time"]').fill('14:30');
  await dialog.locator('[name="link"]').fill('https://example.com/meeting');
  await dialog.locator('[name="notes"]').fill('Apresentação da startup');
}
try {
  await mkdir('output/meetings', { recursive: true });
  const { page, context } = await session('investidor');
  await page.goto(origin + '/investidor/reunioes', {
    waitUntil: 'domcontentloaded',
  });
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .waitFor();
  failList = false;
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'Nenhuma reunião encontrada' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .first()
    .click();
  assert.equal(new URL(page.url()).pathname, '/investidor/reunioes');
  let dialog = page.getByRole('dialog', {
    name: 'Agendar reunião',
    exact: true,
  });
  await dialog
    .getByRole('combobox', { name: 'Startup', exact: true })
    .selectOption(startup.id);
  await fill(dialog);
  await page.screenshot({ path: 'output/meetings/schedule-desktop.png' });
  await dialog
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  await dialog.getByRole('alert').waitFor();
  assert.equal(
    await dialog.locator('[name="notes"]').inputValue(),
    'Apresentação da startup',
  );
  await dialog
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Reunião agendada', exact: true })
    .waitFor();
  assert.deepEqual(submitted, {
    startupId: startup.id,
    dataHoraAgendada: `${date}T17:30:00.000Z`,
    linkReuniao: 'https://example.com/meeting',
    notas: 'Apresentação da startup',
  });
  assert.equal(creates, 2);
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Ver detalhes', exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByRole('button', { name: 'Ver detalhes', exact: true })
    .waitFor();
  await page.getByRole('button', { name: 'Calendário', exact: true }).click();
  await page.getByRole('button', { name: '14:30 Aurora Tecnologia' }).click();
  await page
    .getByRole('button', { name: 'Cancelar reunião', exact: true })
    .click();
  let confirmation = page.getByRole('dialog', {
    name: 'Atualizar status da reunião?',
  });
  await confirmation
    .getByRole('button', { name: 'Confirmar', exact: true })
    .click();
  await confirmation.getByRole('alert').waitFor();
  await confirmation
    .getByRole('button', { name: 'Confirmar', exact: true })
    .click();
  await page.getByRole('dialog', { name: 'Detalhes da reunião' }).waitFor();
  assert.equal(
    await page
      .getByRole('button', { name: 'Cancelar reunião', exact: true })
      .count(),
    0,
  );
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelada', exact: true }).click();
  await page.getByRole('button', { name: 'Lista', exact: true }).click();
  await page.getByRole('button', { name: 'Ver detalhes' }).waitFor();
  await page
    .getByRole('searchbox', { name: 'Buscar participante' })
    .fill('inexistente');
  await page
    .getByRole('heading', { name: 'Nenhuma reunião encontrada' })
    .waitFor();
  await page.getByRole('searchbox').fill('');
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .first()
    .click();
  dialog = page.getByRole('dialog', { name: 'Agendar reunião', exact: true });
  await dialog.getByRole('combobox').selectOption(startup.id);
  await page.screenshot({ path: 'output/meetings/schedule-mobile.png' });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/investidor/mensagens?usuario=startup-user');
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Agendar reunião', exact: true });
  await dialog.getByText('Aurora Tecnologia', { exact: true }).waitFor();
  assert.equal(await dialog.getByRole('combobox').count(), 0);
  await fill(dialog);
  await dialog
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Reunião agendada', exact: true })
    .waitFor();
  assert.equal(submitted.startupId, 'startup-profile');
  await page.getByRole('link', { name: 'Ver na agenda' }).click();
  await page.waitForURL('**/investidor/reunioes');
  assert.equal(new URL(page.url()).pathname, '/investidor/reunioes');
  await page.goto(origin + '/investidor/matches');
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .first()
    .waitFor();
  await page.screenshot({ path: 'output/meetings/matches-desktop.png' });
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .first()
    .click();
  dialog = page.getByRole('dialog', { name: 'Agendar reunião', exact: true });
  await dialog.getByText('Aurora Tecnologia', { exact: true }).waitFor();
  await page.screenshot({ path: 'output/meetings/from-match.png' });
  await context.close();
  const startupSession = await session('startup');
  await startupSession.page.goto(origin + '/startup/reunioes');
  await startupSession.page
    .getByRole('button', { name: 'Ver detalhes' })
    .waitFor();
  assert.equal(
    await startupSession.page
      .getByRole('button', { name: 'Agendar reunião', exact: true })
      .count(),
    0,
  );
  await startupSession.context.close();
  assert.deepEqual(errors, []);
  console.log(
    'Agenda: creation, retry, persistence, calendar, cancellation, search, mobile, matches, chat and startup permissions passed.',
  );
} catch (error) {
  if (lastPage && !lastPage.isClosed()) {
    console.error(lastPage.url(), await lastPage.locator('body').innerText());
    await lastPage.screenshot({ path: 'output/meetings/failure.png' });
  }
  throw error;
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
