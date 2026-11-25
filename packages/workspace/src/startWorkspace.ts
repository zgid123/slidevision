import type { IDeck } from '@contracts/project';
import type { ViteDevServer } from 'vite';

import { loadConfig } from './config/loadConfig';
import { createWorkspaceServer } from './server/createWorkspaceServer';
import { DeckServers } from './server/DeckServers';
import { findDecks } from './utils/findDecks';

interface IStartWorkspaceParams {
  root: string;
  port?: number;
}

export interface IWorkspace {
  decks: IDeck[];
  server: ViteDevServer;
  deckServers: DeckServers;
  close: () => Promise<void>;
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
  const deckServers = new DeckServers({
    root,
    decks,
  });
  const server = await createWorkspaceServer({
    root,
    decks,
    deckServers,
    port,
  });

  return {
    decks,
    server,
    deckServers,
    close: async () => {
      await deckServers.stopAll();
      await server.close();
    },
  };
}
