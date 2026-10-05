import { test, expect } from '@playwright/test';

test('perfil público bloqueia conversa e agendamento antes da aprovação', async ({
  page,
}) => {
  const user = {
    id: 'public-approval',
    nome: 'Teste',
    email: 'camila.investidora.2109@example.com',
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
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  let status = 'pendente';
  await page.route('**/auth/profile', (route) =>
    route.fulfill({ json: { statusModeracao: status } }),
  );
  await page.goto('/startups/solnexo');
  await expect(
    page.getByRole('button', { name: 'Agendar reunião', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Enviar mensagem', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('link', { name: 'Enviar mensagem', exact: true }),
  ).toHaveCount(0);
  status = 'aprovado';
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Agendar reunião', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('link', { name: 'Enviar mensagem', exact: true }),
  ).toBeVisible();
});

for (const role of ['startup', 'investidor'] as const) {
  test(`${role}: somente aprovação libera navegação e acesso direto às conexões`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    const user = {
      id: `approval-${role}`,
      nome: 'Pessoa de teste',
      email:
        role === 'investidor'
          ? 'camila.investidora.2109@example.com'
          : 'approval@example.com',
      tipoPerfil: role,
    };
    await page.addInitScript(
      (usuario) =>
        localStorage.setItem(
          'juntai:auth-session',
          JSON.stringify({ token: 'test-token', usuario }),
        ),
      user,
    );
    await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
    let status = 'pendente';
    await page.route('**/auth/profile', (route) =>
      route.fulfill({
        json: {
          id: 'profile',
          atualizadoEm: '2026-10-05T12:00:00Z',
          statusModeracao: status,
          ...(role === 'startup'
            ? {
                nomeFantasia: 'Startup de teste',
                segmento: 'fintech',
                estagio: 'mvp',
                modeloNegocio: 'b2b',
              }
            : {
                nome: 'Pessoa de teste',
                tipoInvestidor: 'anjo',
                segmentosInteresse: [],
                estagiosInteresse: [],
                modelosInteresse: [],
                regioesInteresse: [],
              }),
        },
      }),
    );
    for (const blocked of [
      'pendente',
      'rejeitado',
      'suspenso',
      'desconhecido',
    ]) {
      status = blocked;
      await page.goto(`/${role}/inicio`);
      const nav = page.getByRole('navigation', { name: 'Navegação do perfil' });
      for (const name of ['Matches', 'Mensagens', 'Reuniões']) {
        await expect(
          nav.getByRole('button', { name, exact: true }),
        ).toBeDisabled();
        await expect(nav.getByRole('link', { name, exact: true })).toHaveCount(
          0,
        );
      }
      await expect(
        page.getByRole('button', { name: 'Abrir mensagens', exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Abrir reuniões', exact: true }),
      ).toBeDisabled();
      for (const path of [
        'mensagens',
        'reunioes',
        ...(role === 'investidor' ? ['matches'] : []),
      ]) {
        await page.goto(`/${role}/${path}`);
        await expect(page).toHaveURL(`/${role}/inicio`);
      }
      await page.goto(`/${role}/perfil`);
      await expect(
        nav.getByRole('button', { name: 'Mensagens', exact: true }),
      ).toBeDisabled();
    }
    if (role === 'investidor') {
      status = 'pendente';
      await page.goto('/startups/solnexo');
      await expect(
        page.getByRole('button', { name: 'Agendar reunião', exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Enviar mensagem', exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole('link', { name: 'Enviar mensagem', exact: true }),
      ).toHaveCount(0);
    }
    status = 'aprovado';
    await page.goto(`/${role}/inicio`);
    const nav = page.getByRole('navigation', { name: 'Navegação do perfil' });
    await expect(
      nav.getByRole('link', { name: 'Mensagens', exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Reuniões', exact: true }),
    ).toBeVisible();
    if (role === 'investidor')
      await expect(
        nav.getByRole('link', { name: 'Matches', exact: true }),
      ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Abrir mensagens', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Abrir reuniões', exact: true }),
    ).toBeVisible();
    for (const path of [
      'mensagens',
      'reunioes',
      ...(role === 'investidor' ? ['matches'] : []),
    ]) {
      await page.goto(`/${role}/${path}`);
      await expect(page).toHaveURL(`/${role}/${path}`);
    }
    status = 'suspenso';
    await page.reload();
    await expect(page).toHaveURL(`/${role}/inicio`);
  });
}
