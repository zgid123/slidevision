import { join } from 'node:path';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { createServer, type ViteDevServer } from 'vite';

import type { IDeck } from '../interface';
import { clientDir } from '../paths';
import { unoConfig } from './unoConfig';
import { workspacePlugin } from './workspacePlugin';

const defaultPort = 3000;

interface ICreateWorkspaceServerParams {
  root: string;
  decks: IDeck[];
  port?: number;
}

export async function createWorkspaceServer({
  root,
  decks,
  port,
}: ICreateWorkspaceServerParams): Promise<ViteDevServer> {
  const server = await createServer({
    root: clientDir,
    cacheDir: join(root, 'node_modules', '.slidevision'),
    configFile: false,
    envDir: false,
    clearScreen: false,
    logLevel: 'warn',
    server: {
      host: 'localhost',
      port: port ?? defaultPort,
    },
    plugins: [
      vue(),
      UnoCSS({
        ...unoConfig,
        configFile: false,
      }),
      workspacePlugin({
        decks,
      }),
    ],
  });

  await server.listen();

  return server;
}
