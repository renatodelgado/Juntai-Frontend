import { defineConfig } from 'cypress';
import { loadEnv } from 'vite';

// A API do teste acompanha a mesma .env.local que o Vite usa no frontend.
// Credenciais ficam em cypress.env.json ou em variáveis CYPRESS_* do processo.
const frontendEnv = loadEnv('development', process.cwd(), 'VITE_');

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 900,
  defaultCommandTimeout: 15000,
  video: true,
  screenshotOnRunFailure: true,
  retries: 0,
  responseTimeout: 90000,
  env: {
    API_URL: frontendEnv.VITE_API_URL || 'http://localhost:3333',
  },
  screenshotsFolder: 'cypress/artifacts/screenshots',
  videosFolder: 'cypress/artifacts/videos',
  e2e: {
    baseUrl: 'http://localhost:5173',
    // O cenário anterior usa dados simulados e não representa a plataforma atual.
    specPattern: 'cypress/e2e/fluxo-plataforma.cy.ts',
    supportFile: false,
    testIsolation: true,
  },
});
