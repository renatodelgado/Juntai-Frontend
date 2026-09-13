import { expect, test, type Page } from '@playwright/test';
import { createDraft } from '../../src/features/startup-onboarding/model/types';
import { LEGAL_VERSION } from '../../src/features/startup-onboarding/model/submission';

async function continueStep(page: Page) {
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/localidades/estados/PE/municipios?*', (route) =>
    route.fulfill({
      json: [
        { id: 2611606, nome: 'Recife' },
        { id: 2609600, nome: 'Olinda' },
      ],
    }),
  );
});

test('cadastro completo, revisão editável, anexo, consentimento e recuperação local', async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/cadastro/startup');
  await expect(
    page.getByRole('heading', { name: 'Vamos começar pela sua startup' }),
  ).toBeVisible();
  const originalPosition = await page
    .locator('#name')
    .evaluate((input) => input.getBoundingClientRect().top + window.scrollY);
  await continueStep(page);
  await expect(page.getByText('Campo obrigatório').first()).toBeVisible();
  expect(
    await page
      .locator('#name')
      .evaluate((input) => input.getBoundingClientRect().top + window.scrollY),
  ).toBe(originalPosition);
  await page.screenshot({
    path: 'test-results/onboarding-errors.png',
    fullPage: true,
  });
  await page.getByLabel(/^Logo da startup/).setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#E6655E';
        context.fillRect(0, 0, 32, 32);
        return canvas.toDataURL('image/png').split(',')[1]!;
      }),
      'base64',
    ),
  });
  await expect(
    page.getByAltText('Logo da startup', { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Nome da startup', { exact: true })
    .fill('Maré Criativa');
  await page
    .getByLabel('Descrição curta', { exact: true })
    .fill('Conectamos artistas de Pernambuco a oportunidades de trabalho.');
  await continueStep(page);
  await page.getByLabel('Segmento principal').selectOption('creative_economy');
  await page.getByRole('radio', { name: /^MVP/ }).check();
  await continueStep(page);
  await page.getByRole('checkbox', { name: 'B2B', exact: true }).check();
  await page
    .getByLabel('Quem é o cliente da sua startup?')
    .fill('Pequenos negócios e artistas de Pernambuco.');
  await page
    .getByLabel('Qual problema sua startup resolve?')
    .fill('Dificuldade de encontrar profissionais criativos locais.');
  await page
    .getByLabel('Como vocês resolvem esse problema?')
    .fill('Uma plataforma de oportunidades e portfólios.');
  await continueStep(page);
  await page.getByLabel('Estado', { exact: true }).selectOption('PE');
  await expect(page.getByLabel('Cidade', { exact: true })).toBeEnabled();
  await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
  await page
    .getByRole('group', { name: 'Onde vocês atuam hoje?' })
    .getByLabel('Nordeste')
    .check();
  await page
    .getByRole('group', { name: 'Em quais regiões vocês pretendem crescer?' })
    .getByLabel('Nordeste')
    .check();
  await continueStep(page);
  await page.getByLabel(/^Número de clientes/).fill('0');
  await page
    .getByLabel('Qual é o faturamento atual da startup?', { exact: true })
    .selectOption('none');
  await page.getByLabel('Tamanho da equipe').selectOption('2_5');
  await continueStep(page);
  await page.getByRole('radio', { name: /^Sim/ }).check();
  await page.getByLabel('Quanto pretendem captar?').fill('500000');
  await page.getByLabel('Desenvolvimento de produto', { exact: true }).check();
  await page.getByLabel('Mentoria', { exact: true }).check();
  await continueStep(page);
  await page
    .getByRole('radio', { name: 'Investidor + mentor', exact: true })
    .check();
  await page.getByLabel('Tecnologia', { exact: true }).check();
  await page
    .getByRole('group', {
      name: 'Regiões de interesse para encontrar parceiros',
    })
    .getByLabel('Nordeste')
    .check();
  await continueStep(page);
  await page
    .getByLabel(/^Seu pitch/)
    .fill('Criatividade local, conexões que transformam.');
  await page.locator('#attachment').setInputFiles({
    name: 'pitch.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nPitch da Maré Criativa'),
  });
  await page
    .getByRole('button', { name: 'Preencher Proposta de valor' })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel(/^Proposta de valor/)
    .fill('Facilitar o acesso a profissionais criativos de Pernambuco.');
  await page.screenshot({ path: 'test-results/onboarding-canvas-modal.png' });
  await page
    .getByRole('button', { name: 'Salvar e fechar', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Editar Proposta de valor' }),
  ).toContainText('Preenchido');
  await page.screenshot({
    path: 'test-results/onboarding-canvas-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('button', { name: 'Mostrar etapas' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar etapas' }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const activeStep = await page.locator('[aria-current="step"]').boundingBox();
  expect(activeStep?.x).toBeGreaterThanOrEqual(0);
  expect((activeStep?.x ?? 0) + (activeStep?.width ?? 0)).toBeLessThanOrEqual(
    390,
  );
  await page.getByRole('button', { name: 'Ocultar etapas' }).click();
  await expect(page.locator('[aria-current="step"]')).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole('button', { name: 'Salvar e continuar depois' }).click();
  await expect(page.getByRole('status')).toContainText('Salvo neste navegador');
  await page.reload();
  await expect(
    page.getByRole('heading', {
      name: 'Agora conte a história da sua startup',
    }),
  ).toBeVisible();
  await expect(page.getByText(/pitch.pdf/)).toBeVisible();
  await page.getByRole('button', { name: 'Editar Proposta de valor' }).click();
  await expect(
    page.getByRole('dialog').getByLabel(/^Proposta de valor/),
  ).toHaveValue('Facilitar o acesso a profissionais criativos de Pernambuco.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await continueStep(page);
  await page.getByRole('button', { name: 'Adicionar integrante' }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Ana Souza');
  await page.getByLabel('Cargo/função', { exact: true }).fill('Fundadora');
  await continueStep(page);
  await expect(
    page.getByRole('heading', {
      name: 'Confira seu perfil antes de entrar no Juntaí!',
    }),
  ).toBeVisible();
  await expect(page.getByText('R$ 500.000,00')).toBeVisible();
  await page
    .getByRole('button', { name: 'Editar Sobre a startup', exact: true })
    .click();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    'Maré Criativa',
  );
  await page
    .getByLabel('Nome da startup', { exact: true })
    .fill('Maré Conecta');
  await page
    .getByRole('button', { name: 'Salvar alterações e revisar' })
    .click();
  await expect(page.getByText('Maré Conecta', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Finalizar cadastro', exact: true })
    .click();
  await page.getByRole('button', { name: 'Ler Termos de Uso' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Termos de Uso' }),
  ).toBeVisible();
  expect(page.context().pages()).toHaveLength(1);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Fechar', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Ler Política de Privacidade' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Política de Privacidade' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Enviar cadastro' }).click();
  await expect(page.getByRole('alert')).toContainText('Falta só ajustar');
  await page.locator('#termsAccepted').check();
  await page.locator('#privacyAcknowledged').check();
  await page.getByRole('button', { name: 'Enviar cadastro' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  let requests = 0;
  await page.route('**/startups', async (route) => {
    requests++;
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({
      nome: 'Ana Souza',
      nomeFantasia: 'Maré Conecta',
      regiao: 'recife',
      capitalProcurado: 500000,
    });
    await route.fulfill({
      status: 201,
      json: { id: 'startup-id', statusModeracao: 'pendente' },
    });
  });
  await page.getByLabel('Nome completo do responsável').fill('Ana Souza');
  await page
    .getByLabel('Região do cadastro', { exact: true })
    .selectOption('recife');
  const primary = page.getByLabel('Modelo de negócio principal');
  if (await primary.count()) await primary.selectOption('b2b');
  await page.getByLabel('E-mail de acesso').fill('mare@example.com');
  await page.getByLabel('Crie uma senha').fill('Teste-local-123');
  await page.getByLabel('Confirme a senha').fill('Teste-local-123');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Startup cadastrada!' }),
  ).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page).toHaveURL('/');
  expect(browserErrors).toEqual([]);
});

test('perfil exige login e home oferece os dois públicos', async ({ page }) => {
  await page.goto('/startup/perfil');
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tenho uma startup' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Sou um investidor ou mentor' }).click();
  await expect(page).toHaveURL(/\/cadastro\/investidor$/);
  await expect(
    page.getByRole('heading', { name: 'Vamos começar por você' }),
  ).toBeVisible();
});

test('mobile, salvamento, retorno e remoção confirmada', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cadastro/startup');
  await expect(
    page.getByRole('heading', { name: 'Vamos começar pela sua startup' }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/onboarding-mobile.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByLabel('Nome da startup', { exact: true })
    .fill('Rascunho móvel');
  await page.getByRole('button', { name: 'Salvar e continuar depois' }).click();
  await expect(page.getByRole('status')).toContainText('Salvo neste navegador');
  await page.reload();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    'Rascunho móvel',
  );
  await page
    .getByRole('button', { name: 'Remover rascunho', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Voltar' })
    .click();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    'Rascunho móvel',
  );
  await page
    .getByRole('button', { name: 'Remover rascunho', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Remover rascunho' })
    .click();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    '',
  );
});

test('desktop e confirmação ao sair sem salvar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/cadastro/startup');
  await expect(
    page.getByRole('heading', { name: 'Vamos começar pela sua startup' }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/onboarding-desktop.png',
    fullPage: true,
  });
  await page.getByLabel('Nome da startup', { exact: true }).fill('Não perder');
  await page.getByRole('link', { name: 'Juntaí! — início' }).click();
  await expect(page.getByRole('dialog')).toContainText('Sair sem salvar');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Voltar' })
    .click();
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    'Não perder',
  );
});

test('falha de armazenamento mantém os dados na tela', async ({ page }) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException('Storage full', 'QuotaExceededError');
    };
  });
  await page.goto('/cadastro/startup');
  await page
    .getByLabel('Nome da startup', { exact: true })
    .fill('Não descartar');
  await page.getByRole('button', { name: 'Salvar e continuar depois' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Não conseguimos salvar',
  );
  await expect(page.getByLabel('Nome da startup', { exact: true })).toHaveValue(
    'Não descartar',
  );
});

test('erro de cidades oferece nova tentativa e permite selecionar um município', async ({
  page,
}) => {
  let serviceAvailable = false;
  await page.route('**/api/v1/localidades/estados/PE/municipios?*', (route) => {
    return !serviceAvailable
      ? route.fulfill({ status: 503, body: 'Unavailable' })
      : route.fulfill({ json: [{ id: 2611606, nome: 'Recife' }] });
  });
  await page.goto('/');
  await page.evaluate(
    async (saved) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('keyval-store');
        request.onupgradeneeded = () =>
          request.result.createObjectStore('keyval');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction('keyval', 'readwrite');
          transaction
            .objectStore('keyval')
            .put(saved, 'juntai:startup-onboarding:v1');
          transaction.oncomplete = () => {
            request.result.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        };
      });
    },
    {
      version: 1,
      data: { ...createDraft(), state: 'PE' },
      step: 'location',
      completed: [],
      savedAt: new Date().toISOString(),
      legalVersion: LEGAL_VERSION,
      attachment: null,
      previewCompletedAt: null,
    },
  );
  await page.goto('/cadastro/startup');
  await expect(page.getByRole('alert')).toContainText(
    'Não conseguimos carregar as cidades',
  );
  serviceAvailable = true;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByLabel('Cidade', { exact: true })).toBeEnabled();
  await page.getByLabel('Cidade', { exact: true }).selectOption('2611606');
  await expect(page.getByLabel('Cidade', { exact: true })).toHaveValue(
    '2611606',
  );
});
