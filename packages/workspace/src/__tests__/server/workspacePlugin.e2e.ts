import type { ViteDevServer } from 'vite';

import { startWorkspace } from '../../startWorkspace';
import {
  deckFactory,
  type ITestDeck,
  pngBytes,
} from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

describe('[Workspace API]', () => {
  let workspace: ITestWorkspace;
  let server: ViteDevServer;
  let baseUrl: string;
  let alpha: ITestDeck;
  let beta: ITestDeck;
  let gamma: ITestDeck;

  beforeAll(async () => {
    alpha = deckFactory.withCover().build({
      folder: 'decks/alpha',
    });
    beta = deckFactory.build({
      folder: 'decks/beta',
      background: 'https://example.com/beta.png',
    });
    gamma = deckFactory.build({
      folder: 'decks/gamma',
      background: './assets/missing.png',
    });
    workspace = await workspaceFactory.create({
      decks: [alpha, beta, gamma],
    });

    ({ server } = await startWorkspace({
      root: workspace.root,
      port: 0,
    }));

    const url = server.resolvedUrls?.local[0];

    if (!url) {
      throw new Error('The workspace server has no local URL.');
    }

    baseUrl = url.replace(/\/$/, '');
  });

  afterAll(async () => {
    await server.close();
    await removeWorkspace(workspace);
  });

  describe('GET /__slidevision/api/decks', () => {
    suite('when decks are found', () => {
      it('returns each deck with its status and cover URL', async () => {
        const response = await fetch(`${baseUrl}/__slidevision/api/decks`);

        expect(await response.json()).toEqual([
          {
            id: 'decks/alpha',
            name: alpha.title,
            status: 'stopped',
            coverUrl: '/__slidevision/api/decks/decks%2Falpha/cover',
          },
          {
            id: 'decks/beta',
            name: beta.title,
            status: 'stopped',
            coverUrl: 'https://example.com/beta.png',
          },
          {
            id: 'decks/gamma',
            name: gamma.title,
            status: 'stopped',
          },
        ]);
      });
    });
  });

  describe('GET /__slidevision/api/decks/:id/cover', () => {
    suite('when the deck has a cover file', () => {
      it('returns the image', async () => {
        const response = await fetch(
          `${baseUrl}/__slidevision/api/decks/decks%2Falpha/cover`,
        );

        expect({
          status: response.status,
          contentType: response.headers.get('content-type'),
          body: new Uint8Array(await response.arrayBuffer()),
        }).toEqual({
          status: 200,
          contentType: 'image/png',
          body: pngBytes,
        });
      });
    });

    suite('when the deck cover file is missing', () => {
      it('returns not found', async () => {
        const response = await fetch(
          `${baseUrl}/__slidevision/api/decks/decks%2Fgamma/cover`,
        );

        expect(response.status).toEqual(404);
      });
    });

    suite('when the id is not a configured deck', () => {
      it('returns not found instead of reading the path', async () => {
        const response = await fetch(
          `${baseUrl}/__slidevision/api/decks/..%2Fslidevision.json/cover`,
        );

        expect(response.status).toEqual(404);
      });
    });
  });

  describe('GET /', () => {
    suite('when the landing page is requested', () => {
      it('returns the app shell', async () => {
        const response = await fetch(`${baseUrl}/`);

        expect(await response.text()).toContain('<div id="app"></div>');
      });
    });
  });
});
