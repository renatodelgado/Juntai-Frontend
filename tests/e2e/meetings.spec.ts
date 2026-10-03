import { test, expect } from '@playwright/test';

test('agenda supports filters, calendar, accepting, rescheduling and confirmed cancellation', async ({
  page,
}) => {
  const user = {
    id: 'agenda-camila',
    nome: 'Camila Torres',
    email: 'camila.investidora.2109@example.com',
    tipoPerfil: 'investidor',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'demo-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  await page.goto('/investidor/reunioes');
  await expect(
    page.getByRole('heading', { name: 'Reuniões Agendadas', exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Navegação do perfil' })
      .getByRole('link', { name: 'Reuniões', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByRole('article', { name: 'Conhecer a SolNexo' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Entrar na reunião' }),
  ).toHaveCount(0);
  await page
    .getByRole('searchbox', { name: 'Buscar participante' })
    .fill('inexistente');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma reunião encontrada' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).first().click();
  await page
    .getByRole('button', { name: 'Visualização em calendário' })
    .click();
  await expect(
    page.getByRole('region', { name: 'Calendário de reuniões' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Conhecer a SolNexo/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Detalhes da reunião' }),
  ).toContainText('O link da reunião ainda não foi informado.');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Semana', exact: true }).click();
  await page.getByRole('button', { name: 'Próximo período' }).click();
  await page.getByRole('button', { name: 'Hoje', exact: true }).click();
  await page.getByRole('button', { name: 'Visualização em lista' }).click();
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await page
    .getByRole('article', { name: 'Parcerias para o agronegócio' })
    .getByRole('button', { name: 'Ver detalhes' })
    .click();
  await page.getByRole('button', { name: 'Aceitar convite' }).click();
  await expect(
    page.getByRole('dialog').getByText('Confirmada', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  const editor = page.getByRole('dialog', { name: 'Agendar reunião' });
  await editor
    .getByLabel('Participante', { exact: true })
    .selectOption('solnexo');
  await editor
    .getByLabel('Assunto', { exact: true })
    .fill('Conversa de estratégia');
  await editor.getByLabel('Data', { exact: true }).fill('2027-10-15');
  await editor.getByLabel('Horário', { exact: true }).fill('14:00');
  await editor
    .getByLabel('Formato', { exact: true })
    .selectOption('presential');
  await editor
    .getByLabel('Endereço (opcional)', { exact: true })
    .fill('Rua de teste, 123, Fortaleza');
  await editor.getByRole('button', { name: 'Enviar convite' }).click();
  const meeting = page.getByRole('article', { name: 'Conversa de estratégia' });
  await expect(meeting).toContainText('Aguardando confirmação');
  await meeting.getByRole('button', { name: 'Ver detalhes' }).click();
  await expect(
    page.getByRole('button', { name: 'Aceitar convite' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Reagendar', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Reagendar reunião' })
    .getByLabel('Horário', { exact: true })
    .fill('15:00');
  await page.getByRole('button', { name: 'Revisar reagendamento' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Confirmar reagendamento?' }),
  ).toContainText('14:00');
  await page
    .getByRole('button', { name: 'Confirmar reagendamento', exact: true })
    .click();
  await expect(meeting).toContainText('15:00');
  await page.reload();
  await page.getByRole('button', { name: 'Pendentes', exact: true }).click();
  await expect(meeting).toContainText('15:00');
  await meeting.getByRole('button', { name: 'Ver detalhes' }).click();
  await page
    .getByRole('button', { name: 'Cancelar reunião', exact: true })
    .click();
  await page
    .getByLabel('Motivo (opcional)')
    .fill('Precisamos reorganizar a agenda');
  await page.getByRole('button', { name: 'Confirmar cancelamento' }).click();
  await page.getByRole('button', { name: 'Canceladas', exact: true }).click();
  await expect(meeting).toContainText('Cancelada');
  await meeting.getByRole('button', { name: 'Ver detalhes' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Precisamos reorganizar a agenda',
  );
  await expect(
    page.getByRole('button', { name: 'Reagendar', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Próximas', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: 'test-results/meetings-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/meetings-mobile.png',
    fullPage: true,
  });
});

test('startup sees only its meetings and invitations from authorized counterparts', async ({
  page,
}) => {
  const user = {
    id: 'agenda-solnexo',
    nome: 'SolNexo Energia',
    email: 'solnexo.teste.2109@example.com',
    tipoPerfil: 'startup',
  };
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'demo-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (route) => route.fulfill({ json: user }));
  await page.goto('/startup/reunioes');
  await expect(
    page.getByRole('article', { name: 'Conhecer a SolNexo' }),
  ).toContainText('Camila Torres');
  await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
  await expect(
    page.getByRole('article', { name: 'Mentoria de expansão comercial' }),
  ).toContainText('Bruno Almeida');
  await page
    .getByRole('button', { name: 'Agendar reunião', exact: true })
    .click();
  await expect(
    page.getByLabel('Participante', { exact: true }).locator('option'),
  ).toHaveText(['Selecione uma conexão', 'Camila Torres', 'Bruno Almeida']);
});
