import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli.ts'],
  outDir: 'lib',
  platform: 'node',
  format: 'esm',
  dts: false,
});
