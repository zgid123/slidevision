import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli.ts', 'src/host.ts'],
  outDir: 'lib',
  platform: 'node',
  format: 'esm',
  dts: false,
});
