import type { ViteDevServer } from 'vite';

import { loadConfig } from './config/loadConfig';
import type { IDeck } from './interface';
import { createWorkspaceServer } from './server/createWorkspaceServer';
import { findDecks } from './utils/findDecks';

interface IStartWorkspaceParams {
  root: string;
  port?: number;
}

interface IWorkspace {
  decks: IDeck[];
  server: ViteDevServer;
}

export async function startWorkspace({
  root,
  port,
}: IStartWorkspaceParams): Promise<IWorkspace> {
  const config = await loadConfig({
    root,
  });
  const decks = await findDecks({
    root,
    patterns: config.decks,
  });
  const server = await createWorkspaceServer({
    root,
    decks,
    port,
  });

  return {
    decks,
    server,
  };
}
