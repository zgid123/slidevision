import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const workspaceHost = import.meta.resolve('@slidevision/workspace/host');

export default defineConfig({
  entry: {
    host: fileURLToPath(workspaceHost),
  },
  outDir: 'lib',
  platform: 'node',
  format: 'esm',
  dts: false,
  deps: {
    alwaysBundle: [/./],
    onlyBundle: false,
  },
  copy: [
    {
      from: fileURLToPath(new URL('./slidev', workspaceHost)),
      to: 'lib',
    },
  ],
});
