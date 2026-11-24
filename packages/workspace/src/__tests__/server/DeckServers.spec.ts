import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { IDeckSummary } from '../../../client/shared';
import { DeckServers } from '../../server/DeckServers';
import { findDecks } from '../../utils/findDecks';
import { deckFactory } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

const isServing = async (url: string | undefined): Promise<boolean> => {
  try {
    return url !== undefined && (await fetch(url)).ok;
  } catch {
    return false;
  }
};

const waitForHotUpdate = (
  url: string,
  change: () => Promise<void>,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url.replace('http', 'ws'), 'vite-hmr');
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('No hot update received.'));
    }, 20_000);

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as {
        type: string;
        event?: string;
      };

      if (message.type === 'connected') {
        void change();

        return;
      }

      if (message.event === 'slidev:update-slide') {
        clearTimeout(timer);
        socket.close();
        resolve(message.event);
      }
    });
  });
};

describe('#DeckServers', () => {
  let workspace: ITestWorkspace;
  let deckServers: DeckServers;

  const createDeckServers = async (): Promise<DeckServers> => {
    return new DeckServers({
      root: workspace.root,
      decks: await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      }),
    });
  };

  beforeEach(async () => {
    workspace = await workspaceFactory.withSlidev().create({
      decks: [
        deckFactory.build({
          folder: 'decks/alpha',
        }),
        deckFactory.build({
          folder: 'decks/beta',
        }),
        deckFactory.withMissingTheme().build({
          folder: 'decks/broken',
        }),
      ],
    });
    deckServers = await createDeckServers();
  });

  afterEach(async () => {
    await deckServers.stopAll();
    await removeWorkspace(workspace);
  });

  describe('.open', () => {
    suite('when the deck is stopped', () => {
      it('starts Slidev and returns the running deck URL', async () => {
        const deck = await deckServers.open({
          id: 'decks/alpha',
        });

        expect({
          status: deck.status,
          isServing: await isServing(deck.url),
        }).toEqual({
          status: 'running',
          isServing: true,
        });
      });
    });

    suite('when the deck is already running', () => {
      it('reuses the same server', async () => {
        const first = await deckServers.open({
          id: 'decks/alpha',
        });
        const second = await deckServers.open({
          id: 'decks/alpha',
        });

        expect(second.url).toEqual(first.url);
      });
    });

    suite('when the same deck is opened twice at once', () => {
      it('starts a single server', async () => {
        const statuses: string[] = [];

        deckServers.subscribe((summary) => {
          statuses.push(summary.status);
        });

        const [first, second] = await Promise.all([
          deckServers.open({
            id: 'decks/alpha',
          }),
          deckServers.open({
            id: 'decks/alpha',
          }),
        ]);

        expect({
          sameUrl: first.url === second.url,
          statuses,
        }).toEqual({
          sameUrl: true,
          statuses: ['starting', 'running'],
        });
      });
    });

    suite('when another deck is opened', () => {
      it('keeps the first deck serving', async () => {
        const alpha = await deckServers.open({
          id: 'decks/alpha',
        });
        const beta = await deckServers.open({
          id: 'decks/beta',
        });

        expect({
          differentUrls: alpha.url !== beta.url,
          alphaServing: await isServing(alpha.url),
          betaServing: await isServing(beta.url),
        }).toEqual({
          differentUrls: true,
          alphaServing: true,
          betaServing: true,
        });
      });
    });

    suite('when Slidev cannot start the deck', () => {
      it('reports failed with the Slidev output and leaves running decks serving', async () => {
        const alpha = await deckServers.open({
          id: 'decks/alpha',
        });
        const broken = await deckServers.open({
          id: 'decks/broken',
        });

        expect({
          status: broken.status,
          mentionsTheme: broken.error?.includes('slidevision-missing-theme'),
          alphaServing: await isServing(alpha.url),
        }).toEqual({
          status: 'failed',
          mentionsTheme: true,
          alphaServing: true,
        });
      });
    });

    suite('when a failed deck is fixed and opened again', () => {
      it('starts the deck', async () => {
        const entry = join(workspace.root, 'decks/broken/slides.md');

        await deckServers.open({
          id: 'decks/broken',
        });
        await writeFile(
          entry,
          (await readFile(entry, 'utf8')).replace(
            'slidevision-missing-theme',
            'none',
          ),
        );

        const deck = await deckServers.open({
          id: 'decks/broken',
        });

        expect({
          status: deck.status,
          isServing: await isServing(deck.url),
        }).toEqual({
          status: 'running',
          isServing: true,
        });
      });
    });

    suite('when a running deck is edited', () => {
      it('pushes a hot update to the open deck', async () => {
        const deck = await deckServers.open({
          id: 'decks/alpha',
        });
        const entry = join(workspace.root, 'decks/alpha/slides.md');
        const event = await waitForHotUpdate(deck.url ?? '', async () => {
          await writeFile(
            entry,
            (await readFile(entry, 'utf8')).replace(
              '# First slide',
              '# Edited slide',
            ),
          );
        });

        expect(event).toEqual('slidev:update-slide');
      });
    });
  });

  describe('.stopAll', () => {
    suite('when decks are running', () => {
      it('stops every deck server', async () => {
        const decks: IDeckSummary[] = [
          await deckServers.open({
            id: 'decks/alpha',
          }),
          await deckServers.open({
            id: 'decks/beta',
          }),
        ];

        await deckServers.stopAll();

        const serving = await Promise.all(
          decks.map((deck) => {
            return isServing(deck.url);
          }),
        );

        expect({
          serving,
          statuses: deckServers.summaries().map((deck) => deck.status),
        }).toEqual({
          serving: [false, false],
          statuses: ['stopped', 'stopped', 'stopped'],
        });
      });
    });
  });
});
