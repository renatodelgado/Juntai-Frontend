import { test, expect, type Page } from '@playwright/test';

const next = async (page: Page) =>
  page.getByRole('button', { name: 'Continuar', exact: true }).click();

test('foto do investidor pode ser enviada, recarregada e removida na edição', async ({
  page,
}) => {
  const user = {
    id: 'avatar-user',
    nome: 'Ana Teste',
    email: 'avatar@example.com',
    tipoPerfil: 'investidor',
  };
  const remote = {
    id: 'avatar-profile',
    nome: user.nome,
    tipoInvestidor: 'mentor',
    statusModeracao: 'pendente',
    atualizadoEm: '2026-10-06T12:00:00Z',
    estado: 'PE',
    cidade: 'Recife',
    segmentosInteresse: [],
    estagiosInteresse: [],
    regioesInteresse: [],
    modelosInteresse: [],
    avatarUrl: null as string | null,
  };
  const url = 'https://example.com/avatar.png';
  await page.addInitScript(
    (usuario) =>
      localStorage.setItem(
        'juntai:auth-session',
        JSON.stringify({ token: 'test-token', usuario }),
      ),
    user,
  );
  await page.route('**/auth/me', (r) => r.fulfill({ json: user }));
  await page.route('**/auth/profile', (r) => r.fulfill({ json: remote }));
  await page.route(url, (r) =>
    r.fulfill({
      path: 'output/imagegen/test-profiles-20261006/investidor-avatar-01.png',
    }),
  );
  await page.route('**/uploads/investidor/avatar', (r) => {
    expect(r.request().headers().authorization).toBe('Bearer test-token');
    if (r.request().method() === 'DELETE') {
      remote.avatarUrl = null;
      return r.fulfill({ status: 204 });
    }
    remote.avatarUrl = url;
    return r.fulfill({ status: 201, json: { url } });
  });
  await page.goto('/investidor/perfil');
  await page
    .getByRole('button', { name: 'Editar Sobre você', exact: true })
    .click();
  await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
  await page
    .locator('#investor-photo')
    .setInputFiles(
      'output/imagegen/test-profiles-20261006/investidor-avatar-01.png',
    );
  await expect(
    page
      .getByRole('dialog')
      .getByRole('img', { name: 'Foto de perfil (opcional)', exact: true }),
  ).toHaveAttribute('src', /^data:image\/png/);
  await page
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(
    page.getByRole('img', { name: 'Foto de Ana Teste', exact: true }),
  ).toHaveAttribute('src', url);
  await page.reload();
  await expect(
    page.getByRole('img', { name: 'Foto de Ana Teste', exact: true }),
  ).toHaveAttribute('src', url);
  await page
    .getByRole('button', { name: 'Editar Sobre você', exact: true })
    .click();
  await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
  await page
    .getByRole('button', { name: 'Remover imagem', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Salvar alterações', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('img', { name: 'Foto de Ana Teste', exact: true }),
  ).toHaveCount(0);
});
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/localidades/estados/PE/municipios?*', (route) =>
    route.fulfill({ json: [{ id: 2611606, nome: 'Recife' }] }),
  );
});

for (const role of ['Mentor', 'Investidor + mentor']) {
  test(`cadastro na API de ${role}`, async ({ page }) => {
    const mentor = role === 'Mentor';
    let requests = 0;
    let uploads = 0;
    await page.route('**/auth/login', (r) =>
      r.fulfill({ json: { token: 'upload-token' } }),
    );
    await page.route('**/uploads/investidor/avatar', async (r) => {
      uploads++;
      expect(r.request().headers().authorization).toBe('Bearer upload-token');
      expect(r.request().headers()['content-type']).toBe('image/png');
      if (uploads === 1)
        return r.fulfill({
          status: 502,
          json: { message: 'Falha de upload de teste' },
        });
      return r.fulfill({
        status: 201,
        json: {
          url: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
        },
      });
    });
    await page.route('**/investidores', async (route) => {
      requests++;
      expect(route.request().method()).toBe('POST');
      const body = route.request().postDataJSON();
      expect(body.tipoInvestidor).toBe(mentor ? 'mentor' : 'anjo_mentor');
      expect(body.regioesInteresse).toEqual(['nordeste']);
      expect(body.estagiosInteresse).toEqual(['mvp']);
      expect(body.estado).toBe('PE');
      expect(body.cidade).toBe('Recife');
      expect(body.areasAjuda).toEqual(['produto_tecnologia']);
      expect(body.jaAtuouComStartups).toBe(false);
      expect(body.disponibilidade).toBe('algumas_horas_semana');
      if (mentor) expect(body).not.toHaveProperty('ticketMinimo');
      if (requests === 1)
        await route.fulfill({
          status: 400,
          json: { message: 'E-mail já cadastrado.' },
        });
      else
        await route.fulfill({
          status: 201,
          json: { id: 'investor-id', statusModeracao: 'pendente' },
        });
    });
    await page.goto('/cadastro/investidor');
    await next(page);
    await expect(page.getByText('Campo obrigatório').first()).toBeVisible();
    await page
      .getByLabel('Nome completo', { exact: true })
      .fill('Ana do Recife');
    if (mentor)
      await page
        .locator('#investor-photo')
        .setInputFiles(
          'output/imagegen/test-profiles-20261006/investidor-avatar-01.png',
        );
    await page.getByLabel('Estado', { exact: true }).selectOption('PE');
    await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
    await page
      .getByRole('button', { name: 'Salvar e continuar depois' })
      .click();
    await expect(page.getByRole('status')).toHaveText('Salvo neste navegador.');
    await page.reload();
    await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
      'Ana do Recife',
    );
    await page.screenshot({
      path: `test-results/investor-${mentor ? 'mentor' : 'both'}-desktop.png`,
      fullPage: true,
    });
    await next(page);
    await page
      .getByRole('radio', { name: new RegExp(`^${role.replace('+', '\\+')}`) })
      .check();
    await next(page);
    await page.getByRole('checkbox', { name: 'Fintech', exact: true }).check();
    await next(page);
    await page.getByRole('checkbox', { name: /^MVP/ }).check();
    await next(page);
    if (mentor) {
      await expect(
        page.getByText('Você escolheu participar como mentor.', {
          exact: false,
        }),
      ).toBeVisible();
    } else {
      await page
        .getByLabel('Qual é o menor valor que você costuma investir?', {
          exact: true,
        })
        .fill('50000');
      await page
        .getByLabel('Qual é o maior valor que você costuma investir?', {
          exact: true,
        })
        .fill('10000');
      await next(page);
      await expect(
        page.getByText('O máximo deve ser igual ou maior que o mínimo'),
      ).toBeVisible();
      await page
        .getByLabel('Qual é o maior valor que você costuma investir?', {
          exact: true,
        })
        .fill('500000');
    }
    await next(page);
    await page.getByRole('checkbox', { name: 'B2B', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Nordeste', exact: true }).check();
    await next(page);
    if (!mentor)
      await page.getByRole('radio', { name: 'Moderado', exact: true }).check();
    await page
      .getByRole('checkbox', { name: 'Tecnologia', exact: true })
      .check();
    await next(page);
    await page.getByRole('radio', { name: 'Não', exact: true }).check();
    await next(page);
    await page
      .getByLabel(/^Quanto tempo você pode dedicar\?/)
      .selectOption('algumas_horas_semana');
    await page
      .getByRole('radio', { name: 'Semanalmente', exact: true })
      .check();
    await page
      .getByRole('checkbox', { name: 'Conversas online', exact: true })
      .check();
    await page
      .getByRole('group', { name: 'Você aceita mentorias?' })
      .getByRole('radio', { name: 'Sim', exact: true })
      .check();
    if (!mentor)
      await page
        .getByRole('group', {
          name: 'Você está aberto a novos investimentos neste momento?',
        })
        .getByRole('radio', { name: 'Talvez', exact: true })
        .check();
    await next(page);
    await page.getByRole('checkbox', { name: /^Mentoria/ }).check();
    await next(page);
    await next(page);
    await next(page);
    await page
      .getByRole('button', { name: 'Termos de Uso', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#termsAccepted').check();
    await page.locator('#privacyAcknowledged').check();
    const email = mentor ? 'mentor@example.com' : 'investor@example.com';
    await page.getByLabel('E-mail de acesso').fill(email);
    await page.getByLabel('Crie uma senha').fill('Teste-local-123');
    await page.getByLabel('Confirme a senha').fill('Teste-local-123');
    await page
      .getByRole('button', { name: 'Finalizar cadastro', exact: true })
      .click();
    await expect(page.getByRole('alert')).toContainText('E-mail já cadastrado');
    await expect(page.getByLabel('E-mail de acesso')).toHaveValue(email);
    await page.getByLabel('E-mail de acesso').fill('outro@example.com');
    await page
      .getByRole('button', { name: 'Finalizar cadastro', exact: true })
      .click();
    if (mentor) {
      await expect(page.getByRole('alert')).toContainText(
        'Sua conta foi criada, mas a foto',
      );
      expect(requests).toBe(2);
      await page
        .getByRole('button', { name: 'Finalizar cadastro', exact: true })
        .click();
    }
    await expect(
      page.getByRole('heading', { name: 'Perfil enviado!' }),
    ).toBeVisible();
    if (mentor) expect(uploads).toBe(2);
    expect(requests).toBe(2);
    await page.getByRole('link', { name: 'Entrar na minha conta' }).click();
    await expect(page).toHaveURL('/login');
  });
}
