import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server = await createServer({
  server: { host: '127.0.0.1', port: 5187 },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(60_000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const user = {
    id: 'test-investor',
    nome: 'Investidor Teste',
    email: 'test@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript(
    (user) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario: user }),
      ),
    user,
  );
  const exposures = [];
  let mode = 'supervised';
  let fail = false;
  await page.route(/https?:\/\/(localhost|127\.0\.0\.1):3333\//, (r) =>
    r.fulfill({ status: 404, json: { message: 'Unmocked test endpoint' } }),
  );
  let avatarUrl = 'http://127.0.0.1:5187/test-avatar.png';
  await page.route('**/test-avatar*.png', (r) =>
    r.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.route('**/auth/me', (r) => r.fulfill({ json: user }));
  await page.route('**/auth/profile', (r) =>
    r.fulfill({
      json: {
        id: 'profile-test',
        nome: user.nome,
        statusModeracao: 'aprovado',
        atualizadoEm: '2026-11-01',
        avatarUrl,
        tipoInvestidor: 'anjo',
        segmentosInteresse: ['fintech'],
        estagiosInteresse: ['mvp'],
        regioesInteresse: ['nordeste'],
        modelosInteresse: ['b2b'],
      },
    }),
  );
  await page.route('**/mensagens/conversas', (r) => r.fulfill({ json: [] }));
  await page.route('**/startups/interesses', (r) => r.fulfill({ json: [] }));
  await page.route('**/startups/exposicoes', (r) => {
    exposures.push(r.request().postDataJSON());
    return r.fulfill({ json: { id: 'test-exposure' } });
  });
  await page.route('**/startups/discovery?*', (r) => {
    if (fail)
      return r.fulfill({
        status: 503,
        json: { message: 'Serviço indisponível' },
      });
    const query = new URL(r.request().url()).searchParams;
    const items = [0.95, 0.75, 0.5, 0.1778].map((p, i) => ({
      id: 'startup-' + i,
      nomeFantasia: 'Startup ' + i,
      descricaoCurta: 'Uma solução para aproximar negócios e pessoas.',
      segmento: 'fintech',
      estagio: 'mvp',
      modeloNegocio: 'b2b',
      cidade: 'Fortaleza',
      estado: 'CE',
      statusModeracao: 'aprovado',
      atualizadoEm: '2026-11-01',
      criadoEm: '2026-11-01',
      ...(mode === 'supervised'
        ? { origemRecomendacao: mode, probabilidadeInteresse: p }
        : {
            origemRecomendacao: 'rules',
            compatibility: 85,
            avisos: [
              'ajuda: Áreas de ajuda ou necessidades não informadas. Necessidades sem equivalência definida: parcerias_estrategicas.',
              'Cobertura incompleta; compare o score junto da cobertura.',
            ],
          }),
      contextoExposicao: 'signed-' + mode + '-' + i,
    }));
    return r.fulfill({
      json: {
        items: query.get('ids')
          ? items.filter((item) =>
              query.get('ids').split(',').includes(item.id),
            )
          : query.get('q')
            ? items.slice(0, 1)
            : items,
        total: 4,
        hasMore: false,
        facets: { locations: ['CE'], segments: 1, regions: 1 },
        origemRecomendacao: mode,
        ...(mode === 'rules'
          ? { fallback: { de: 'supervised', motivo: 'timeout' } }
          : {}),
      },
    });
  });
  await page.goto('http://127.0.0.1:5187/investidor/startups', {
    waitUntil: 'commit',
  });
  await page.getByRole('meter').first().waitFor();

  assert.equal(await page.getByRole('meter').count(), 4);
  assert.ok((await page.locator('body').innerText()).includes('17,8%'));
  assert.equal(exposures.length, 0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('meter').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  assert.equal(exposures.length, 0, 'Hidden tabs must not confirm exposures');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1300);
  assert.ok(exposures.length > 0);
  assert.ok(
    exposures.every(
      (e) => Object.keys(e).length === 1 && e.contexto.startsWith('signed-'),
    ),
  );
  await mkdir('test-results', { recursive: true });
  await page.screenshot({
    path: 'test-results/recommendations-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'test-results/recommendations-mobile.png',
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  mode = 'rules';
  await page.reload();
  await page
    .getByText(
      'Modelo experimental indisponível. Exibindo compatibilidade por regras.',
    )
    .waitFor();
  assert.equal(
    await page.getByRole('meter').first().getAttribute('aria-valuenow'),
    '85',
  );
  fail = true;
  await page.reload();
  await page
    .getByRole('heading', { name: 'Não foi possível carregar as startups' })
    .waitFor();
  fail = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.getByRole('meter').first().waitFor();
  await page.getByRole('link', { name: 'Ver startup' }).first().click();
  await page
    .getByRole('heading', { name: 'Recomendação', exact: true })
    .waitFor();
  assert.equal(
    await page.getByRole('meter').getAttribute('aria-valuenow'),
    '85',
  );
  assert.ok(
    (await page.locator('body').innerText()).includes('parcerias estratégicas'),
  );
  assert.ok(
    !(await page.locator('body').innerText()).includes(
      'parcerias_estrategicas',
    ),
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('meter').waitFor();
  assert.equal(
    await page.getByRole('meter').getAttribute('aria-valuenow'),
    '85',
  );
  const accountPhoto = page.locator('header .account img');
  assert.equal(await accountPhoto.getAttribute('src'), avatarUrl);
  avatarUrl = 'http://127.0.0.1:5187/test-avatar-v2.png';
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(
    (url) =>
      document.querySelector('header .account img')?.getAttribute('src') ===
      url,
    avatarUrl,
  );
  for (const path of [
    '/investidor/inicio',
    '/investidor/matches',
    '/investidor/mensagens',
    '/investidor/reunioes',
    '/investidor/startups',
  ]) {
    await page.goto('http://127.0.0.1:5187' + path, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(
      (url) =>
        document.querySelector('header .account img')?.getAttribute('src') ===
        url,
      avatarUrl,
    );
  }
  avatarUrl = null;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(() =>
    document
      .querySelector('header .account img')
      ?.getAttribute('alt')
      ?.startsWith('Avatar padrão'),
  );
  assert.deepEqual(errors, []);
  console.log(
    'Browser checks passed: supervised, tiers, signed exposure, responsive layout, rules fallback, 503 and retry.',
  );
} finally {
  await browser.close();
  await server.close();
}
