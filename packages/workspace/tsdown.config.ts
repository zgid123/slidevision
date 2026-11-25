import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    host: 'src/host.ts',
    'slidev/start': 'src/slidev/start.ts',
  },
  outDir: 'lib',
  platform: 'node',
  format: 'esm',
  dts: false,
  copy: [
    {
      from: ['src/slidev/addon/pages/*.vue', 'src/slidev/addon/setup/*.ts'],
      to: 'lib',
      flatten: false,
    },
  ],
});
