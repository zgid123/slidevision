import { createInterface } from 'node:readline';
import { PassThrough } from 'node:stream';
import { deckStatus, projectKind } from '@contracts/project';

import {
  hostEvent,
  type IHostEvent,
  runHost,
  type THostMessage,
  type THostResponse,
} from '../../host/runHost';
import { deckFactory } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

interface ITestHost {
  events: IHostEvent[];
  send: (line: string) => void;
  next: () => Promise<THostMessage>;
  request: (
    method: string,
    params?: Record<string, unknown>,
  ) => Promise<THostResponse>;
  close: () => Promise<void>;
}

const isServing = async (url: string | undefined): Promise<boolean> => {
  try {
    return url !== undefined && (await fetch(url)).ok;
  } catch {
    return false;
  }
};

function startHost(): ITestHost {
  const input = new PassThrough();
  const output = new PassThrough();
  const running = runHost({
    input,
    output,
  });
  const lines = createInterface({
    input: output,
  })[Symbol.asyncIterator]();
  const events: IHostEvent[] = [];
  let nextId = 1_000;

  const send = (line: string): void => {
    input.write(`${line}\n`);
  };
  const next = async (): Promise<THostMessage> => {
    const { value, done } = await lines.next();

    if (done) {
      throw new Error('The host closed its output.');
    }

    return JSON.parse(value);
  };

  return {
    events,
    send,
    next,
    request: async (method, params = {}) => {
      const id = nextId;

      nextId += 1;
      send(
        JSON.stringify({
          id,
          method,
          params,
        }),
      );

      for (;;) {
        const message = await next();

        if ('event' in message) {
          events.push(message);

          continue;
        }

        if (message.id === id) {
          return message;
        }
      }
    },
    close: async () => {
      input.end();

      await running;
    },
  };
}

describe('#runHost', () => {
  let workspace: ITestWorkspace;
  let host: ITestHost;

  beforeEach(() => {
    host = startHost();
  });

  afterEach(async () => {
    await host.close();
    await removeWorkspace(workspace);
  });

  suite('when asked to open a deck folder', () => {
    it('answers with the project under the request id', async () => {
      workspace = await workspaceFactory.withoutConfig().create({
        files: {
          'slides.md': "---\ntitle: 'Solo talk'\n---\n",
        },
      });

      host.send(
        JSON.stringify({
          id: 7,
          method: 'open',
          params: {
            root: workspace.root,
          },
        }),
      );

      expect(await host.next()).toEqual({
        id: 7,
        result: expect.objectContaining({
          kind: projectKind.single,
          deck: expect.objectContaining({
            name: 'Solo talk',
          }),
        }),
      });
    });
  });

  suite('when opening fails', () => {
    it('answers with the error message', async () => {
      workspace = await workspaceFactory.withoutConfig().create();

      host.send(
        JSON.stringify({
          id: 1,
          method: 'open',
          params: {
            root: workspace.root,
          },
        }),
      );

      expect(await host.next()).toEqual({
        id: 1,
        error: {
          message: expect.stringContaining(
            'has no slidevision.json or slides.md',
          ),
        },
      });
    });
  });

  suite('when the method is unknown', () => {
    it('answers with an error', async () => {
      workspace = await workspaceFactory.create();

      host.send(
        JSON.stringify({
          id: 2,
          method: 'explode',
        }),
      );

      expect(await host.next()).toEqual({
        id: 2,
        error: {
          message: 'Unknown host method "explode".',
        },
      });
    });
  });

  suite('when a line is not a request', () => {
    it('answers with an error without an id', async () => {
      workspace = await workspaceFactory.create();

      host.send('hello');

      expect(await host.next()).toEqual({
        id: null,
        error: {
          message: 'Not a host request: hello',
        },
      });
    });
  });

  suite('when its input closes', () => {
    it('finishes', async () => {
      workspace = await workspaceFactory.create();

      await expect(host.close()).resolves.toBeUndefined();
    });
  });
  suite('when asked to start a deck', () => {
    it('starts Slidev once, reports each status, and reuses the server', async () => {
      workspace = await workspaceFactory.withSlidev().create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
          }),
        ],
      });

      await host.request('open', {
        root: workspace.root,
      });

      const first = await host.request('startDeck', {
        id: 'decks/alpha',
      });
      const again = await host.request('startDeck', {
        id: 'decks/alpha',
      });
      const url =
        'result' in first ? (first.result as { url?: string }).url : undefined;

      expect(first).toEqual({
        id: expect.any(Number),
        result: {
          id: 'decks/alpha',
          status: deckStatus.running,
          url: expect.stringMatching(/^http:\/\/localhost:\d+\/$/),
        },
      });
      expect(again).toEqual({
        id: expect.any(Number),
        result: {
          id: 'decks/alpha',
          status: deckStatus.running,
          url,
        },
      });
      expect(await isServing(url)).toBe(true);
      expect(
        host.events.map(({ event, data }) => {
          return [event, data.status];
        }),
      ).toEqual([
        [hostEvent.deckRun, deckStatus.starting],
        [hostEvent.deckRun, deckStatus.running],
      ]);

      await host.close();

      expect(await isServing(url)).toBe(false);
    });

    it('reports Slidev output when the deck cannot start', async () => {
      workspace = await workspaceFactory.withSlidev().create({
        decks: [
          deckFactory.withMissingTheme().build({
            folder: 'decks/broken',
          }),
        ],
      });

      await host.request('open', {
        root: workspace.root,
      });

      expect(
        await host.request('startDeck', {
          id: 'decks/broken',
        }),
      ).toEqual({
        id: expect.any(Number),
        result: {
          id: 'decks/broken',
          status: deckStatus.failed,
          error: expect.stringContaining('slidevision-missing-theme'),
        },
      });
    });

    it('refuses a deck it did not discover', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
          }),
        ],
      });

      await host.request('open', {
        root: workspace.root,
      });

      expect(
        await host.request('startDeck', {
          id: '../elsewhere',
        }),
      ).toEqual({
        id: expect.any(Number),
        error: {
          message: 'Unknown deck "../elsewhere".',
        },
      });
    });

    it('refuses before a project is open', async () => {
      workspace = await workspaceFactory.create();

      expect(
        await host.request('startDeck', {
          id: 'decks/alpha',
        }),
      ).toEqual({
        id: expect.any(Number),
        error: {
          message: 'No project is open.',
        },
      });
    });
  });
});
