import { test, expect } from '@playwright/test';

for (const role of ['startup', 'investidor'] as const) {
  test(`${role}: mensagens persistidas, leitura, falha de envio e navegação mobile`, async ({
    page,
  }) => {
    const user = {
      id: '11111111-1111-4111-8111-111111111111',
      nome: 'Teste',
      email: 'teste@example.com',
      tipoPerfil: role,
    };
    const other = '22222222-2222-4222-8222-222222222222';
    const name = role === 'startup' ? 'Investidora Teste' : 'Startup Teste';
    await page.addInitScript(
      (usuario) =>
        localStorage.setItem(
          'juntai:auth-session',
          JSON.stringify({ token: 'test-token', usuario }),
        ),
      user,
    );
    await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
    await page.route('**/auth/profile', (route) =>
      route.fulfill({ json: { statusModeracao: 'aprovado' } }),
    );
    let history = [
      {
        id: '1',
        conversaId: 'conversation',
        conteudo: 'Olá, vamos conversar?',
        enviadoEm: '2026-10-05T12:00:00Z',
        lidoEm: null as string | null,
        remetenteId: other,
      },
    ];
    await page.route('**/mensagens/conversas', (route) =>
      route.fulfill({
        json: [
          {
            conversaId: 'conversation',
            usuarioId: other,
            nome: name,
            tipoPerfil: role === 'startup' ? 'investidor' : 'startup',
            ultimaMensagem: history.at(-1)?.conteudo,
            ultimaMensagemEm: history.at(-1)?.enviadoEm,
            enviadaPorMim: history.at(-1)?.remetenteId === user.id,
            naoLidas: history.filter(
              (m) => m.remetenteId === other && !m.lidoEm,
            ).length,
          },
        ],
      }),
    );
    await page.route(`**/mensagens/${other}`, (route) => {
      history = history.map((m) =>
        m.remetenteId === other ? { ...m, lidoEm: '2026-10-05T12:05:00Z' } : m,
      );
      return route.fulfill({ json: history });
    });
    let reject = true;
    await page.route('**/mensagens', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      expect(route.request().headers().authorization).toBe('Bearer test-token');
      const data = route.request().postDataJSON();
      expect(data.destinatarioId).toBe(other);
      if (reject) {
        await route.fulfill({
          status: 500,
          json: { message: 'Falha temporária de envio' },
        });
        return;
      }
      const item = {
        id: String(history.length + 1),
        conversaId: 'conversation',
        conteudo: data.conteudo,
        enviadoEm: new Date().toISOString(),
        lidoEm: null,
        remetenteId: user.id,
      };
      history.push(item);
      await route.fulfill({ status: 201, json: item });
    });
    await page.goto(`/${role}/mensagens`);
    await page
      .getByRole('button', { name: `Conversa com ${name}`, exact: true })
      .click();
    await expect(
      page.getByText('Olá, vamos conversar?', { exact: true }),
    ).toHaveCount(2);
    const input = page.getByRole('textbox', { name: 'Mensagem', exact: true });
    await input.fill('Mensagem salva no servidor');
    await page
      .getByRole('button', { name: 'Enviar mensagem', exact: true })
      .click();
    await expect(page.getByRole('alert')).toContainText('Falha temporária');
    await expect(input).toHaveValue('Mensagem salva no servidor');
    reject = false;
    await page
      .getByRole('button', { name: 'Enviar mensagem', exact: true })
      .click();
    await expect(input).toHaveValue('');
    await page.reload();
    await page
      .getByRole('button', { name: `Conversa com ${name}`, exact: true })
      .click();
    await expect(
      page
        .getByRole('article')
        .filter({ hasText: 'Mensagem salva no servidor' }),
    ).toBeVisible();
    history.push({
      id: '3',
      conversaId: 'conversation',
      conteudo: 'Nova resposta recebida',
      enviadoEm: new Date().toISOString(),
      lidoEm: null,
      remetenteId: other,
    });
    await expect(
      page.getByRole('article').filter({ hasText: 'Nova resposta recebida' }),
    ).toBeVisible({ timeout: 15000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Voltar às conversas' }).click();
    await expect(
      page.getByRole('heading', { name: 'Conversas', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test('estado vazio não cria conversas fictícias', async ({ page }) => {
  const user = {
    id: 'empty',
    nome: 'Teste',
    email: 'solnexo.teste.2109@example.com',
    tipoPerfil: 'startup',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (r) => r.fulfill({ json: user }));
  await page.route('**/auth/profile', (r) =>
    r.fulfill({ json: { statusModeracao: 'aprovado' } }),
  );
  await page.route('**/mensagens/conversas', (r) => r.fulfill({ json: [] }));
  await page.goto('/startup/mensagens');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma conversa ainda' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Quando um investidor iniciar contato, você poderá responder aqui.',
    ),
  ).toBeVisible();
});
