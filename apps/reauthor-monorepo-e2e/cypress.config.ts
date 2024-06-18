import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run reauthor-monorepo:serve',
        production: 'nx run reauthor-monorepo:preview',
      },
      ciWebServerCommand: 'nx run reauthor-monorepo:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
