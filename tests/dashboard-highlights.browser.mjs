import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const server = await createServer({
  server: { host: '127.0.0.1', port: 5195 },
});
await server.listen();
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(60_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const usuario = {
    id: 'investor-test',
    nome: 'Investidora Teste',
    email: 'test@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    usuario,
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: usuario }));
  await page.route('**/auth/profile', (route) =>
    route.fulfill({
      json: {
        id: 'profile-test',
        nome: usuario.nome,
        statusModeracao: 'aprovado',
        atualizadoEm: '2026-11-04',
        tipoInvestidor: 'anjo',
        segmentosInteresse: ['fintech'],
        estagiosInteresse: ['mvp'],
        regioesInteresse: ['nordeste'],
        modelosInteresse: ['b2b'],
      },
    }),
  );
  let failed = true;
  let requests = 0;
  await page.route('**/startups/destaques', (route) => {
    requests++;
    return route.fulfill(
      failed
        ? { status: 503, json: { message: 'Unavailable' } }
        : {
            json: {
              items: [100, 95, 90].map((score, index) => ({
                id: `startup-${index}`,
                nomeFantasia: `Destaque ${index + 1}`,
                statusModeracao: 'aprovado',
                atualizadoEm: '2026-11-04',
                criadoEm: '2026-11-01',
                segmento: 'fintech',
                estagio: 'mvp',
                modeloNegocio: 'b2b',
                descricaoCurta: 'Tecnologia para novas oportunidades.',
                cidade: 'Fortaleza',
                estado: 'CE',
                origemRecomendacao: 'rules',
                compatibility: score,
              })),
            },
          },
    );
  });
  await page.goto('http://127.0.0.1:5195/investidor/inicio');
  await page
    .getByText('Não conseguimos carregar suas recomendações agora.')
    .waitFor();
  failed = false;
  await page
    .getByRole('button', { name: 'Tentar novamente', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'Destaque 3', exact: true })
    .waitFor();
  const section = page.locator('[aria-labelledby="recommendations-title"]');
  assert.equal(await section.getByRole('article').count(), 3);
  assert.equal(await section.getByRole('meter').count(), 3);
  assert.equal(
    await section
      .getByRole('link', { name: 'Descubra mais' })
      .getAttribute('href'),
    '/investidor/startups',
  );
  assert.equal(
    await section.getByRole('link', { name: 'Conhecer startup' }).count(),
    3,
  );
  const count = requests;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(700);
  assert.equal(
    requests,
    count,
    'Focus must not randomly replace visible recommendations.',
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await mkdir('test-results', { recursive: true });
    await section.screenshot({
      path: `test-results/dashboard-highlights-${width}.png`,
    });
  }
  assert.deepEqual(errors, []);
  console.log(
    'Dashboard: three scored cards, navigation, retry, stable selection and responsive layout passed.',
  );
} finally {
  await browser.close();
  await server.close();
}
