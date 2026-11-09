import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const server = await createServer({
  server: { host: '127.0.0.1', port: 5197 },
});
await server.listen();
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  for (const role of ['investidor', 'startup']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const usuario = {
      id: `user-${role}`,
      nome: 'Conta de teste',
      email: 'teste@example.com',
      tipoPerfil: role,
    };
    const profile = {
      id: `profile-${role}`,
      nome: 'Perfil de teste',
      nomeFantasia: 'Startup de teste',
      statusModeracao: 'aprovado',
      atualizadoEm: '2026-11-04',
      tipoInvestidor: 'mentor',
      tituloProfissional: 'Mentora',
      segmentosInteresse: ['fintech'],
      estagiosInteresse: ['mvp'],
      regioesInteresse: ['nordeste'],
      modelosInteresse: ['b2b'],
      segmento: 'fintech',
      estagio: 'mvp',
      modeloNegocio: 'b2b',
      regioesAtuacao: ['nordeste'],
      regioesCrescimento: ['nordeste'],
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
      route.fulfill({ json: profile }),
    );
    await page.route('**/mensagens/conversas', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/startups/interesses', (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route('**/startups/destaques', (route) =>
      route.fulfill({ json: { items: [] } }),
    );
    await page.route('**/startups/discovery?*', (route) =>
      route.fulfill({
        json: {
          items: [],
          total: 0,
          hasMore: false,
          facets: { locations: [], segments: 0, regions: 0 },
        },
      }),
    );
    const expectedRole = role === 'startup' ? 'Startup' : 'Mentor';
    for (const tab of [
      'inicio',
      'perfil',
      'mensagens',
      'reunioes',
      ...(role === 'investidor' ? ['startups'] : []),
    ]) {
      await page.goto(`http://127.0.0.1:5197/${role}/${tab}`);
      await page.waitForFunction(
        (role) =>
          document.querySelector('[data-account-role]')?.textContent === role,
        expectedRole,
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Menu da conta', exact: true })
          .count(),
        1,
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Sair da conta', exact: true })
          .count(),
        0,
      );
      await page
        .getByRole('button', { name: 'Menu da conta', exact: true })
        .click();
      await page
        .getByRole('menuitem', { name: 'Perguntas frequentes', exact: true })
        .click();
      await page
        .getByRole('dialog', { name: 'Perguntas frequentes', exact: true })
        .waitFor();
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    }
    await page.goto(`http://127.0.0.1:5197/${role}/perfil`);
    await page.getByRole('heading', { name: 'Dados para conexões' }).waitFor();
    const feature = page
      .getByRole('heading', { name: 'Dados para conexões' })
      .locator('..');
    const column = feature.locator('..');
    assert.equal(
      await column
        .getByRole('progressbar', { name: 'Completude do perfil' })
        .count(),
      1,
    );
    assert.equal(
      await column.getByText('Cadastro concluído', { exact: true }).count(),
      1,
    );
    if (role === 'investidor') {
      assert.equal(
        await column
          .getByRole('link', { name: 'Explorar startups' })
          .getAttribute('href'),
        '/investidor/startups',
      );
      assert.equal(
        await column
          .getByRole('heading', { name: 'Preferências', exact: true })
          .count(),
        0,
      );
      assert.equal(
        await column
          .getByRole('heading', {
            name: 'Seu perfil para startups',
            exact: true,
          })
          .count(),
        0,
      );
    }
    for (const label of [
      'Configurações pessoais',
      'Privacidade no uso da aplicação',
      'Ajuda e suporte',
    ]) {
      await page
        .getByRole('button', { name: 'Menu da conta', exact: true })
        .click();
      await page.getByRole('menuitem', { name: label, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: label, exact: true });
      await dialog.waitFor();
      assert.equal(
        await dialog.locator('input').count(),
        0,
        'No unsupported account settings.',
      );
      await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
    }
    await page
      .getByRole('button', { name: 'Menu da conta', exact: true })
      .click();
    await page.keyboard.press('End');
    assert.equal(
      await page
        .getByRole('menuitem', { name: 'Sair', exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('menu').count(), 0);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 950 });
      await page
        .getByRole('button', { name: 'Menu da conta', exact: true })
        .click();
      const menu = page.getByRole('menu');
      await menu.waitFor();
      const box = await menu.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width);
      await mkdir('test-results', { recursive: true });
      await page.screenshot({
        path: `test-results/account-${role}-${width}.png`,
        fullPage: true,
      });
      await page.keyboard.press('Escape');
    }
    await page
      .getByRole('button', { name: 'Menu da conta', exact: true })
      .click();
    await page.getByRole('menuitem', { name: 'Sair', exact: true }).click();
    await page.waitForURL('**/login');
    assert.equal(
      await page.evaluate(() => localStorage.getItem('juntai:auth-session')),
      null,
    );
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `${role}: shared menu, constant role across tabs, profile sidebar, modals, keyboard, mobile and logout passed.`,
    );
  }
} finally {
  await browser.close();
  await server.close();
}
