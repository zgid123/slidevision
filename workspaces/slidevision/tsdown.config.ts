import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    host: fileURLToPath(import.meta.resolve('@slidevision/workspace/host')),
  },
  outDir: 'lib',
  platform: 'node',
  format: 'esm',
  dts: false,
  deps: {
    alwaysBundle: [/./],
    onlyBundle: false,
  },
});
