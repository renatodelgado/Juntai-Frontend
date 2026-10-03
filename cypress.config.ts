import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 900,
  defaultCommandTimeout: 15000,
  video: true,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/artifacts/screenshots',
  videosFolder: 'cypress/artifacts/videos',
  e2e: {
    baseUrl: 'http://127.0.0.1:5175',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
    testIsolation: true,
  },
});
