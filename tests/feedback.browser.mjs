import { chromium } from 'playwright';
import { preview } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server = await preview({
  preview: { host: '127.0.0.1', port: 5199, strictPort: true },
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const user = {
  id: 'investor-user',
  nome: 'Investidor teste',
  email: 'test@example.com',
  tipoPerfil: 'investidor',
};
await context.addInitScript(
  (usuario) =>
    localStorage.setItem(
      'juntai:auth-session',
      JSON.stringify({ token: 'test-token', usuario }),
    ),
  user,
);
const now = new Date().toISOString();
const conversation = {
  conversaId: 'conversation',
  usuarioId: 'startup-user',
  nome: 'Aurora Tecnologia',
  tipoPerfil: 'startup',
  ultimaMensagem: 'Olá',
  ultimaMensagemEm: now,
  enviadaPorMim: true,
  naoLidas: 0,
};
const otherReported = false;
let review = null,
  failSave = true,
  pending = false,
  deferred = 0;
const meeting = {
  id: '1',
  startupId: 's',
  startupNome: 'Aurora Tecnologia',
  investidorId: 'i',
  investidorNome: 'Investidor teste',
  dataHoraAgendada: new Date(Date.now() - 3600000).toISOString(),
  status: 'agendada',
  linkReuniao: null,
  notas: null,
  criadoEm: now,
};
const errors = [];
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
    if (path === '/auth/me') return json(user);
    if (path === '/auth/profile') return json({ statusModeracao: 'aprovado' });
    if (path === '/startups/interesses') return json([]);
    if (path === '/mensagens/conversas') return json([conversation]);
    if (path === '/mensagens/startup-user')
      return json(
        ['investor-user', 'startup-user'].map((id, i) => ({
          id: String(i),
          conversaId: 'conversation',
          conteudo: 'Olá',
          enviadoEm: now,
          lidoEm: null,
          remetenteId: id,
        })),
      );
    if (path === '/reunioes') return json([meeting]);
    if (path === '/reunioes/1/status') {
      meeting.status = req.postDataJSON().status;
      return json(meeting);
    }
    if (path === '/avaliacoes/pendentes')
      return json(
        pending
          ? [{ id: '1', tipo: 'reuniao', nome: 'Aurora Tecnologia' }]
          : [],
      );
    if (path.endsWith('/adiar')) {
      deferred++;
      pending = false;
      return route.fulfill({ status: 204 });
    }
    if (path.startsWith('/avaliacoes/')) {
      if (req.method() === 'PUT') {
        if (failSave) {
          failSave = false;
          return route.fulfill({
            status: 503,
            json: { message: 'Tente enviar novamente.' },
          });
        }
        const body = req.postDataJSON();
        assert.equal(body.nota, 4);
        assert.equal(body.comentario, 'Boa conversa');
        assert.equal(body.resultadoInteracao, 'avancar');
        assert.ok(
          ['intencao', 'realizado'].includes(body.perspectivaInvestimento),
        );
        review = { id: '1', ...body, criadoEm: now, atualizadoEm: now };
      }
      return json({
        elegivel: true,
        nome: 'Aurora Tecnologia',
        avaliacao: path.includes('/conversa/') ? review : null,
        investimentoInformadoPeloOutro:
          path.includes('/conversa/') && otherReported,
        investimentoConfirmado:
          path.includes('/conversa/') &&
          otherReported &&
          review?.perspectivaInvestimento === 'realizado',
      });
    }
    return route.fulfill({ status: 404, json: {} });
  },
);
const page = await context.newPage();
page.setDefaultTimeout(20000);
page.on('pageerror', (e) => errors.push(e.message));
try {
  await mkdir('output/feedback', { recursive: true });
  await page.goto('http://127.0.0.1:5199/investidor/mensagens');
  await page.getByRole('button', { name: /Aurora Tecnologia/ }).click();
  await page
    .getByRole('button', { name: 'Avaliar interação', exact: true })
    .click();
  let dialog = page.getByRole('dialog', {
    name: 'Avaliar interação',
    exact: true,
  });
  await dialog.getByText('Como foi a interação?').waitFor();
  assert.equal(
    await dialog.getByRole('button', { name: 'Salvar avaliação' }).isDisabled(),
    true,
  );
  await dialog.getByRole('radio', { name: '4 estrelas', exact: true }).check();
  assert.equal(await dialog.getByRole('textbox').count(), 0);
  await dialog
    .getByRole('combobox', { name: 'Qual foi o resultado até agora?' })
    .selectOption('avancar');
  await dialog
    .getByRole('combobox', { name: 'Há perspectiva de investimento?' })
    .selectOption('intencao');
  await dialog.locator('summary').click();
  await dialog.getByRole('textbox').fill('Boa conversa');
  await dialog.getByRole('button', { name: 'Salvar avaliação' }).click();
  await dialog
    .getByRole('alert')
    .filter({ hasText: 'Tente enviar novamente.' })
    .waitFor();
  await page.screenshot({ path: 'output/feedback/chat-desktop.png' });
  await dialog.getByRole('button', { name: 'Salvar avaliação' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page
    .getByRole('button', { name: 'Avaliar interação', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Avalia\u00e7\u00e3o enviada' });
  await dialog.getByText(/foi registrada no sistema/).waitFor();
  for (const role of ['radio', 'combobox', 'textbox'])
    assert.equal(await dialog.getByRole(role).count(), 0);
  assert.equal(await dialog.getByRole('button', { name: /Salvar/ }).count(), 0);
  assert.equal(
    await dialog.getByText('Boa conversa', { exact: true }).count(),
    0,
  );
  await dialog
    .getByRole('button', { name: 'Fechar', exact: true })
    .first()
    .click();
  await page.reload();
  await page.getByRole('button', { name: /Aurora Tecnologia/ }).click();
  await page
    .getByRole('button', { name: /Avaliar intera/, exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Avalia\u00e7\u00e3o enviada' });
  await dialog.getByText(/foi registrada no sistema/).waitFor();
  assert.equal(await dialog.getByRole('radio').count(), 0);
  await dialog
    .getByRole('button', { name: 'Fechar', exact: true })
    .first()
    .click();
  await page.goto('http://127.0.0.1:5199/investidor/reunioes');
  await page
    .getByRole('button', { name: /Ver detalhes/ })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Marcar como realizada', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Atualizar status da reunião?' })
    .getByRole('button', { name: 'Confirmar', exact: true })
    .click();
  dialog = page.getByRole('dialog', { name: 'Avaliar interação', exact: true });
  await dialog.getByText('Como foi a interação?').waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'output/feedback/reuniao-mobile.png' });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await dialog
    .getByRole('button', { name: 'Agora não', exact: true })
    .first()
    .click();
  assert.equal(deferred, 1);
  pending = true;
  await page.reload();
  dialog = page.getByRole('dialog', { name: 'Avaliar interação', exact: true });
  await dialog.getByText('Como foi a interação?').waitFor();
  await dialog
    .getByRole('button', { name: 'Agora não', exact: true })
    .first()
    .click();
  assert.equal(deferred, 2);
  assert.deepEqual(errors, []);
  console.log(
    'PASS feedback browser: chat save/retry/submitted privacy after reload, manual completion, mobile layout, persisted defer, compact fields, collapsed comment, investment confirmation and pending reminder',
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
