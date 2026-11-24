import { type IWorkspace, startWorkspace } from '../../startWorkspace';
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
  let started: IWorkspace;
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
    workspace = await workspaceFactory.withSlidev().create({
      decks: [alpha, beta, gamma],
    });
    started = await startWorkspace({
      root: workspace.root,
      port: 0,
    });

    const url = started.server.resolvedUrls?.local[0];

    if (!url) {
      throw new Error('The workspace server has no local URL.');
    }

    baseUrl = url.replace(/\/$/, '');
  });

  afterAll(async () => {
    await started.close();
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

  describe('POST /__slidevision/api/decks/:id/open', () => {
    const openDeck = (id: string, origin?: string): Promise<Response> => {
      return fetch(
        `${baseUrl}/__slidevision/api/decks/${encodeURIComponent(id)}/open`,
        {
          method: 'POST',
          headers: origin
            ? {
                origin,
              }
            : {},
        },
      );
    };

    suite('when the request has no Origin header', () => {
      it('refuses to open the deck', async () => {
        const response = await openDeck('decks/alpha');

        expect(response.status).toEqual(403);
      });
    });

    suite('when the request comes from another site', () => {
      it('refuses to open the deck', async () => {
        const response = await openDeck('decks/alpha', 'http://example.com');

        expect(response.status).toEqual(403);
      });
    });

    suite('when the id is not a configured deck', () => {
      it('returns not found', async () => {
        const response = await openDeck('decks/unknown', baseUrl);

        expect(response.status).toEqual(404);
      });
    });

    suite('when the landing page opens a stopped deck', () => {
      it('starts the deck and returns its URL', async () => {
        const response = await openDeck('decks/alpha', baseUrl);
        const deck = (await response.json()) as {
          status: string;
          url: string;
        };

        expect({
          status: deck.status,
          isServing: (await fetch(deck.url)).ok,
        }).toEqual({
          status: 'running',
          isServing: true,
        });
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
