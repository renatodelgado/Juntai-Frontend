import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const server = await createServer({
  server: { host: '127.0.0.1', port: 5191 },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
try {
  for (const role of ['investidor', 'startup']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    const user = {
      id: 'user-' + role,
      nome: 'Perfil Teste',
      email: 'test@example.com',
      tipoPerfil: role,
    };
    let profile = {
      id: 'profile-' + role,
      nome: user.nome,
      nomeFantasia: 'Startup Teste',
      statusModeracao: 'aprovado',
      atualizadoEm: '2026-11-01',
      estado: 'CE',
      cidade: 'Fortaleza',
      tipoInvestidor: 'anjo',
      tituloProfissional: 'Investidora e mentora',
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
    const patches = [];
    await page.addInitScript(
      (usuario) =>
        localStorage.setItem(
          'juntai:auth-session',
          JSON.stringify({ token: 'test-token', usuario }),
        ),
      user,
    );
    await page.route(/https?:\/\/(localhost|127\.0\.0\.1):3333\//, (r) =>
      r.fulfill({ status: 404, json: {} }),
    );
    await page.route('**/auth/me', (r) => r.fulfill({ json: user }));
    await page.route('**/auth/profile', (r) => r.fulfill({ json: profile }));
    await page.route(
      `**/${role === 'startup' ? 'startups' : 'investidores'}/${profile.id}`,
      (r) => {
        assert.equal(r.request().method(), 'PATCH');
        const patch = r.request().postDataJSON();
        patches.push(patch);
        profile = { ...profile, ...patch };
        return r.fulfill({ json: profile });
      },
    );
    await page.route('**/municipios?*', (r) =>
      r.fulfill({
        json: r.request().url().includes('/PE/')
          ? [{ id: 2611606, nome: 'Recife' }]
          : [
              { id: 2304400, nome: 'Fortaleza' },
              { id: 2312908, nome: 'Sobral' },
            ],
      }),
    );
    const openEditor = async () => {
      await page
        .getByRole('button', {
          name:
            role === 'investidor'
              ? 'Editar Sobre você'
              : 'Editar localização e atuação',
          exact: true,
        })
        .click();
      await page.locator('#cityId:not([disabled])').waitFor();
    };
    const selectedCity = () =>
      page.locator('#cityId option:checked').textContent();
    await page.goto(`http://127.0.0.1:5191/${role}/perfil`, {
      waitUntil: 'domcontentloaded',
    });
    if (role === 'investidor')
      await page.getByText('Investidora e mentora', { exact: true }).waitFor();
    await openEditor();
    if (role === 'investidor') {
      assert.equal(
        await page.locator('#title').inputValue(),
        'Investidora e mentora',
      );
      await page.locator('#title').fill('Investidora anjo');
    }
    assert.equal(
      await selectedCity(),
      'Fortaleza',
      `${role}: restore server city without IBGE ID`,
    );
    await page.locator('#cityId').selectOption('2312908');
    await page
      .getByRole('button', { name: 'Salvar alterações', exact: true })
      .click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(patches.at(-1).cidade, 'Sobral');
    assert.equal(profile.cidade, 'Sobral');
    if (role === 'investidor') {
      assert.equal(profile.tituloProfissional, 'Investidora anjo');
      assert.equal(
        await page.getByText('Investidora anjo', { exact: true }).count(),
        1,
      );
    }
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (role === 'investidor')
      await page.getByText('Investidora anjo', { exact: true }).waitFor();
    if (role === 'investidor') {
      profile.tituloProfissional = 'Mentora de startups';
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await page.getByText('Mentora de startups', { exact: true }).waitFor();
    }
    await openEditor();
    if (role === 'investidor')
      assert.equal(
        await page.locator('#title').inputValue(),
        'Mentora de startups',
      );
    assert.equal(
      await selectedCity(),
      'Sobral',
      `${role}: persisted city after reload`,
    );
    // Saving an unchanged location must not require choosing the same city again.
    await page
      .getByRole('button', { name: 'Salvar alterações', exact: true })
      .click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(profile.cidade, 'Sobral');
    await openEditor();
    await page.locator('#state').selectOption('PE');
    await page.locator('#cityId:not([disabled])').waitFor();
    assert.equal(
      await page.locator('#cityId').inputValue(),
      '',
      `${role}: changing state clears previous city`,
    );
    await page
      .getByRole('button', { name: 'Salvar alterações', exact: true })
      .click();
    assert.equal(
      await page.locator('#cityId').getAttribute('aria-invalid'),
      'true',
    );
    await page.locator('#cityId').selectOption('2611606');
    await page
      .getByRole('button', { name: 'Salvar alterações', exact: true })
      .click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(profile.estado, 'PE');
    assert.equal(profile.cidade, 'Recife');
    if (role === 'investidor') {
      await page
        .getByRole('button', {
          name: 'Editar Como posso ajudar uma startup',
          exact: true,
        })
        .click();
      const footer = page.getByRole('dialog').locator('footer');
      const save = footer.getByRole('button', { name: 'Salvar alterações' });
      const cancel = footer.getByRole('button', {
        name: 'Cancelar',
        exact: true,
      });
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 850 });
        const left = await cancel.boundingBox();
        const right = await save.boundingBox();
        assert.ok(
          left.x < right.x && Math.abs(left.y - right.y) < 2,
          'Cancel left, save right on the same footer row',
        );
        assert.notEqual(
          await save.evaluate((el) => getComputedStyle(el).backgroundColor),
          await cancel.evaluate((el) => getComputedStyle(el).backgroundColor),
        );
      }
      await page
        .getByRole('checkbox', { name: 'Mentoria', exact: true })
        .check();
      await mkdir('test-results', { recursive: true });
      await page.screenshot({
        path: 'test-results/editor-contributions-mobile.png',
      });
      await save.click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.deepEqual(profile.areasAjuda, ['mentoria']);
      assert.equal(
        await page
          .getByText('Adicione as contribuições que você pode oferecer.')
          .count(),
        0,
      );
      assert.equal(
        await page
          .getByRole('button', { name: 'Adicionar contribuições', exact: true })
          .count(),
        0,
      );
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page
        .getByRole('button', {
          name: 'Editar Como posso ajudar uma startup',
          exact: true,
        })
        .click();
      assert.equal(
        await page
          .getByRole('checkbox', { name: 'Mentoria', exact: true })
          .isChecked(),
        true,
      );
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(
        await page
          .getByText('Adicione as contribuições que você pode oferecer.')
          .count(),
        0,
      );
      console.log(
        'Contributions persist, completion prompt disappears, footer order and contrasting colors pass on desktop and mobile.',
      );
    }
    await context.close();
    console.log(
      `${role}: restored selection, PATCH city, reload, unchanged save and state change passed.`,
    );
  }
} finally {
  await browser.close();
  await server.close();
}
