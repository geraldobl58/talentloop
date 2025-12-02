import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['e2e/**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup-e2e.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  plugins: [
    tsconfigPaths(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    swc.vite({
      module: { type: 'es6' },
    }) as any,
  ],
});
