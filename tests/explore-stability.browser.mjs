import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const server = await createServer({
  server: { host: '127.0.0.1', port: 5192 },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(60_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const user = {
    id: 'test-user',
    nome: 'Investidor Teste',
    email: 'test@example.com',
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
  await page.route(/https?:\/\/(localhost|127\.0\.0\.1):3333\//, (route) =>
    route.fulfill({ status: 404, json: {} }),
  );
  let validations = 0;
  await page.route('**/auth/me', (route) => {
    validations++;
    return route.fulfill({ json: { ...user } });
  });
  await page.route('**/auth/profile', (route) =>
    route.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
  let releaseInterests;
  const interestsReady = new Promise((resolve) => {
    releaseInterests = resolve;
  });
  await page.route('**/startups/interesses', async (route) => {
    await interestsReady;
    await route.fulfill({ json: [] });
  });
  let releaseRanking;
  const rankingReady = new Promise((resolve) => {
    releaseRanking = resolve;
  });
  let releaseMore;
  const moreReady = new Promise((resolve) => {
    releaseMore = resolve;
  });
  let rankingRequests = 0;
  await page.route('**/startups/discovery?*', async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const summary = params.get('size') === '1';
    const ranked = params.get('sort') === 'compatibility';
    const filtered = !!params.get('q');
    const pageNumber = Number(params.get('page'));
    const total = filtered ? 3 : summary || !ranked ? 1457 : 1000;
    if (ranked) {
      rankingRequests++;
      if (pageNumber === 0) await rankingReady;
      if (pageNumber === 1) await moreReady;
    }
    const items = Array.from(
      { length: summary ? 1 : filtered ? 3 : 24 },
      (_, index) => ({
        id: 'startup-' + (pageNumber * 24 + index),
        nomeFantasia: 'Startup ' + (pageNumber * 24 + index),
        segmento: 'fintech',
        estagio: 'mvp',
        modeloNegocio: 'b2b',
        descricaoCurta: 'Soluções para novos negócios.',
        statusModeracao: 'aprovado',
        atualizadoEm: '2026-11-01',
        criadoEm: '2026-11-01',
        ...(ranked ? { compatibility: 80, origemRecomendacao: 'rules' } : {}),
      }),
    );
    await route.fulfill({
      json: {
        items,
        total,
        hasMore: !filtered && (pageNumber + 1) * 24 < total,
        facets: { locations: ['CE'], segments: 1, regions: 1 },
        ...(ranked ? { origemRecomendacao: 'rules' } : {}),
      },
    });
  });
  await page.goto('http://127.0.0.1:5192/investidor/startups', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByText('1.457', { exact: true }).waitFor();
  assert.equal(
    await page.getByRole('heading', { name: 'Startup 0', exact: true }).count(),
    0,
    'Summary appears while ranking is still pending',
  );
  releaseRanking();
  await page.getByRole('heading', { name: 'Startup 0', exact: true }).waitFor();
  assert.equal(
    await page.getByRole('meter').count(),
    24,
    'Cards do not wait for the interests endpoint',
  );
  releaseInterests();
  const refreshSession = async () => {
    const before = validations;
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/auth/me')),
      page.evaluate(() => window.dispatchEvent(new Event('focus'))),
    ]);
    await page.waitForTimeout(600);
    assert.ok(validations > before, 'Session is still validated on focus');
  };
  const firstRequests = rankingRequests;
  await refreshSession();
  assert.equal(
    rankingRequests,
    firstRequests,
    'Session revalidation must not restart the ranking',
  );
  await page
    .getByRole('button', { name: 'Carregar mais startups', exact: true })
    .scrollIntoViewIfNeeded();
  await page
    .getByRole('button', { name: 'Carregando mais startups…', exact: true })
    .waitFor();
  assert.equal(
    await page.getByText('Carregando mais startups…', { exact: true }).count(),
    1,
    'One loading indicator only',
  );
  assert.equal(rankingRequests, firstRequests + 1);
  releaseMore();
  await page
    .getByRole('heading', { name: 'Startup 47', exact: true })
    .waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  const afterPaging = rankingRequests;
  await refreshSession();
  assert.equal(rankingRequests, afterPaging);
  assert.equal(
    await page.getByRole('meter').count(),
    48,
    'Loaded pages survive focus/session refresh',
  );
  await page.locator('input[type="search"]').fill('fintech');
  await page.waitForFunction(
    () => document.querySelectorAll('[role="meter"]').length === 3,
  );
  assert.ok(
    (await page.locator('body').innerText()).includes('3 recomendações'),
  );
  await page
    .getByRole('combobox', { name: 'Ordenar startups' })
    .selectOption('recent');
  await page.waitForFunction(
    () => document.querySelectorAll('[role="meter"]').length === 0,
  );
  await page
    .getByText('3 startups encontradas · 3 carregadas', { exact: true })
    .waitFor();
  assert.ok(
    (await page.locator('body').innerText()).includes('3 startups encontradas'),
  );
  assert.deepEqual(errors, []);
  console.log(
    'Explore: full eligible count, independent summary and interests, stable session refresh, retained pages, one loader, filters and ordinary sorting passed.',
  );
} finally {
  await browser.close();
  await server.close();
}
