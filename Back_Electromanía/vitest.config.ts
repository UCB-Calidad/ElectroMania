import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    setupFiles: ['./test/vitest-setup.ts'], // Para los metadatos de Nest
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/test/**',
        'src/**/*.spec.ts',
        'src/**/dto/**/*.dto.ts',
        'src/**/dto/*.dto.ts',
        'src/**/*.module.ts',
        'src/*.module.ts'
      ],
      all: true,
      reporter: ['text', 'json', 'html', "lcov"],
    },
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});