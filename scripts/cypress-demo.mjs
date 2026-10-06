import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { loadEnv } from 'vite';

// Usa o aplicativo Cypress, mesmo quando o terminal herda variáveis do Electron.
delete process.env.ELECTRON_RUN_AS_NODE;
const { default: cypress } = await import('cypress');
const failure = process.argv.includes('--failure');
const interactive = process.argv.includes('--open');
const baseUrl = 'http://127.0.0.1:5175';
const original = 'cypress/e2e/fluxo-plataforma.cy.ts';
const temporary = 'cypress/e2e/falha-controlada.cy.ts';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const folder = `cypress/artifacts/plataforma-real/${runId}${failure ? '-falha' : ''}`;
let server;
let temporaryCreated = false;

try {
  // Lê somente as chaves necessárias. Não imprime senhas, tokens ou respostas de login.
  const local = await readFile('cypress.env.json', 'utf8')
    .then(JSON.parse)
    .catch((error) => {
      if (error.code === 'ENOENT') return {};
      throw new Error('cypress.env.json precisa conter JSON válido.');
    });
  const frontend = loadEnv('development', process.cwd(), 'VITE_');
  const api = (frontend.VITE_API_URL || 'http://localhost:3333').replace(
    /\/$/,
    '',
  );
  const settings = { API_URL: api };
  for (const key of [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'INVESTOR_EMAIL',
    'INVESTOR_PASSWORD',
  ]) {
    settings[key] = process.env[`CYPRESS_${key}`] || local[key];
    if (typeof settings[key] !== 'string' || !settings[key].trim())
      throw new Error(
        `Configure ${key} em cypress.env.json ou CYPRESS_${key}. Nenhum cadastro foi criado.`,
      );
  }
  if (local.API_URL && String(local.API_URL).replace(/\/$/, '') !== api)
    throw new Error(
      'API_URL diverge de VITE_API_URL. A demonstração deve usar a mesma API do frontend.',
    );

  // Confirma acesso real às contas ANTES de criar dados ou abrir o navegador.
  // O investidor deve existir e estar aprovado. O admin não é criado pelo teste.
  for (const [prefix, role] of [
    ['ADMIN', 'admin'],
    ['INVESTOR', 'investidor'],
  ]) {
    let response;
    try {
      response = await fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings[`${prefix}_EMAIL`],
          senha: settings[`${prefix}_PASSWORD`],
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new Error(
        `A API ${api} não respondeu. Inicie o backend e confira VITE_API_URL. Nenhum cadastro foi criado.`,
      );
    }
    if (!response.ok)
      throw new Error(
        `Login ${prefix} recusado (HTTP ${response.status}). Nenhum cadastro foi criado.`,
      );
    const session = await response.json();
    if (
      session.usuario?.tipoPerfil !== role ||
      typeof session.token !== 'string'
    )
      throw new Error(
        `A conta ${prefix} não possui o perfil ${role}. Nenhum cadastro foi criado.`,
      );
    if (role === 'investidor') {
      const profile = await fetch(`${api}/auth/profile`, {
        headers: { Authorization: `Bearer ${session.token}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!profile.ok || (await profile.json()).statusModeracao !== 'aprovado')
        throw new Error(
          'O investidor precisa estar aprovado. Nenhum cadastro foi criado.',
        );
    }
  }

  // Inicia somente o frontend local. O backend existente fica sob controle do usuário.
  server = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      '--host',
      '127.0.0.1',
      '--port',
      '5175',
      '--strictPort',
    ],
    { stdio: 'inherit', windowsHide: true },
  );
  let serverError;
  server.on('error', (error) => {
    serverError = error;
  });
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (serverError) throw serverError;
    if (server.exitCode !== null)
      throw new Error('Vite encerrou. Confira se a porta 5175 está livre.');
    ready = await fetch(baseUrl)
      .then((response) => response.ok)
      .catch(() => false);
    if (ready) break;
    await delay(250);
  }
  if (!ready) throw new Error('Vite não respondeu em 30 segundos.');

  // Falha didática troca somente uma expectativa final. Também cria dados reais.
  // Usa cópia temporária exclusiva e preserva o cenário correto.
  if (failure) {
    const source = await readFile(original, 'utf8');
    const expected = "cy.contains('h1', 'Seus matches')";
    if (!source.includes(expected))
      throw new Error('A asserção didática mudou. Atualize este script.');
    try {
      await writeFile(
        temporary,
        source.replace(
          expected,
          "cy.contains('h1', 'Resultado incorreto para depuração', { timeout: 1500 })",
        ),
        { flag: 'wx' },
      );
      temporaryCreated = true;
    } catch {
      throw new Error(
        'Já existe falha-controlada.cy.ts. Confira essa cópia antes de repetir.',
      );
    }
  }

  // Modo interativo usa a mesma URL e credenciais validadas que o headless.
  const config = { baseUrl, env: settings };
  if (interactive) {
    await cypress.open({ e2e: true, config });
  } else {
    await mkdir(folder, { recursive: true });
    const result = await cypress.run({
      e2e: true,
      spec: failure ? temporary : original,
      config: {
        ...config,
        screenshotsFolder: `${folder}/screenshots`,
        videosFolder: `${folder}/videos`,
      },
    });
    if ('failures' in result) throw new Error(result.message);

    // Relatório guarda contagens reais. Erros detalhados ficam nas evidências locais.
    // Cada rodada recebe uma pasta nova, preservando os resultados anteriores.
    await writeFile(
      `${folder}/resultado.json`,
      JSON.stringify(
        {
          mode: failure ? 'falha controlada com API real' : 'plataforma real',
          apiUrl: api,
          cypressVersion: result.cypressVersion,
          browser: result.browserName,
          startedAt: result.startedTestsAt,
          totalTests: result.totalTests,
          passed: result.totalPassed,
          failed: result.totalFailed,
          durationMs: result.totalDuration,
          messageSent: false,
        },
        null,
        2,
      ),
    );
    if (result.totalPassed) {
      const manifest = await readFile(
        'cypress/artifacts/ultima-execucao-real.json',
        'utf8',
      );
      await writeFile(`${folder}/dados-criados.json`, manifest);
    }
    console.log(`Evidências: ${folder}`);
    process.exitCode = result.totalFailed ? 1 : 0;
  }
} catch (error) {
  // Mensagens próprias evitam despejar respostas autenticadas no terminal.
  console.error(error.message);
  process.exitCode = 1;
} finally {
  // Remove apenas a cópia temporária criada nesta rodada e encerra o Vite próprio.
  if (temporaryCreated) await rm(temporary, { force: true });
  server?.kill();
}
