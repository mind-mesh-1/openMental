import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

//TODO: node for server, jsdom for client
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'], // Ensure this path is correct
    coverage: {
      reporter: ['lcov'],
    },
    testTimeout: 5000, // Increase global timeout to 10000ms (10 seconds)
  },
});
