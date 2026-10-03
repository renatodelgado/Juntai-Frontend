import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

// Codex/Electron pode herdar esta variável; o Cypress precisa iniciar seu app.
delete process.env.ELECTRON_RUN_AS_NODE;
const { default: cypress } = await import('cypress');
const failure = process.argv.includes('--failure');
const interactive = process.argv.includes('--open');
const baseUrl = 'http://127.0.0.1:5175';
const original = 'cypress/e2e/interesse-startup.cy.ts';
const temporary = 'cypress/e2e/falha-controlada.cy.ts';
const folder = `cypress/artifacts/${failure ? 'falha' : 'aprovado'}`;
const server = spawn(
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

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (serverError) throw serverError;
    if (server.exitCode !== null)
      throw new Error(
        'Vite encerrou antes do teste. Verifique se a porta 5175 está livre.',
      );
    ready = await fetch(baseUrl)
      .then((response) => response.ok)
      .catch(() => false);
    if (ready) break;
    await delay(250);
  }
  if (!ready) throw new Error('Vite não respondeu em 30 segundos.');
  if (interactive) {
    await cypress.open({ e2e: true });
  } else {
    await mkdir(folder, { recursive: true });
    if (failure) {
      const source = await readFile(original, 'utf8');
      const expected = "cy.contains('h1', 'Seus matches')";
      if (!source.includes(expected))
        throw new Error(
          'A asserção da demonstração mudou; atualize este script.',
        );
      await writeFile(
        temporary,
        source.replace(
          expected,
          "cy.contains('h1', 'Resultado incorreto para depuração', { timeout: 1500 })",
        ),
      );
    }
    const result = await cypress.run({
      e2e: true,
      spec: failure ? temporary : original,
      config: {
        baseUrl,
        screenshotsFolder: `${folder}/screenshots`,
        videosFolder: `${folder}/videos`,
      },
    });
    if ('failures' in result) throw new Error(result.message);
    // Relatório resumido sem objetos de sessão, cabeçalhos ou credenciais.
    await writeFile(
      `${folder}/resultado.json`,
      JSON.stringify(
        {
          mode: failure ? 'falha controlada' : 'cenário correto',
          cypressVersion: result.cypressVersion,
          browser: result.browserName,
          startedAt: result.startedTestsAt,
          totalTests: result.totalTests,
          passed: result.totalPassed,
          failed: result.totalFailed,
          durationMs: result.totalDuration,
          errors: result.runs.flatMap((run) =>
            run.tests.map((test) => test.displayError).filter(Boolean),
          ),
        },
        null,
        2,
      ),
    );
    process.exitCode = result.totalFailed ? 1 : 0;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (failure) await rm(temporary, { force: true });
  server.kill();
}
