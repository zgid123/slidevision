import { createInterface } from 'node:readline';
import { PassThrough } from 'node:stream';
import { projectKind } from '@contracts/project';

import { runHost, type THostResponse } from '../../host/runHost';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

interface ITestHost {
  send: (line: string) => void;
  next: () => Promise<THostResponse>;
  close: () => Promise<void>;
}

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

  return {
    send: (line) => {
      input.write(`${line}\n`);
    },
    next: async () => {
      const { value, done } = await lines.next();

      if (done) {
        throw new Error('The host closed its output.');
      }

      return JSON.parse(value);
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
});
