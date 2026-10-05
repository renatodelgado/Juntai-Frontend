import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/auth/profile', (route) =>
    route.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
});

test('matches show only investor interests and filters toggle on desktop and mobile', async ({
  page,
}) => {
  const user = {
    id: 'matches-camila',
    nome: 'Camila Torres',
    email: 'camila.investidora.2109@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript((usuario) => {
    localStorage.setItem(
      'juntai:auth-session',
      JSON.stringify({ token: 'demo-token', usuario }),
    );
  }, user);
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  await page.goto('/investidor/matches');
  await expect(
    page.getByRole('heading', { name: 'Você ainda não tem matches' }),
  ).toBeVisible();
  await expect(page.getByRole('article', { name: /Match:/ })).toHaveCount(0);
  await page.evaluate(() =>
    localStorage.setItem(
      'juntai:discovery:matches-camila',
      JSON.stringify({
        saved: [],
        interests: [
          { startupId: 'solnexo', createdAt: '2026-10-01T10:00:00Z' },
        ],
        meetings: [],
        viewed: [],
        discarded: [],
      }),
    ),
  );
  await page.reload();
  await expect(
    page.getByRole('article', { name: 'Match: SolNexo Energia' }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Match: AgroPonte Digital' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Com interesse mútuo' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Conexões que estão acontecendo' }),
  ).toHaveCount(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const control = page.getByRole('combobox', {
      name: 'Compatibilidade mínima',
    });
    await expect(control).toBeHidden();
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
    await expect(control).toBeVisible();
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
    await expect(control).toBeHidden();
  }
});
