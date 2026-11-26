import type { Channel } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import type { DownloadEvent } from '@tauri-apps/plugin-updater';

import {
  checkForUpdatesRequestedEvent,
  updatesApi,
} from '#/features/updates/api';
import type { IUpdateProgress } from '#/features/updates/interface';

interface IInvocation {
  command: string;
  args: unknown;
}

describe('#updatesApi', () => {
  let invocations: IInvocation[];

  beforeEach(() => {
    invocations = [];
  });

  afterEach(() => {
    clearMocks();
  });

  describe('.check', () => {
    suite('when no update is available', () => {
      it('returns null', async () => {
        mockIPC((command, args) => {
          invocations.push({
            command,
            args,
          });

          if (command !== 'plugin:updater|check') {
            throw new Error(`Unexpected command ${command}`);
          }

          return null;
        });

        const result = await updatesApi.check();

        expect(result).toBeNull();
        expect(invocations.map((invocation) => invocation.command)).toEqual([
          'plugin:updater|check',
        ]);
      });
    });

    suite('when an update is available', () => {
      it('returns its version, notes, and streams download progress', async () => {
        const progressUpdates: IUpdateProgress[] = [];

        mockIPC((command, args) => {
          invocations.push({
            command,
            args,
          });

          switch (command) {
            case 'plugin:updater|check': {
              return {
                rid: 7,
                currentVersion: '0.1.0',
                version: '0.2.0',
                date: '2026-11-26T00:00:00Z',
                body: 'Faster deck loading',
                rawJson: {},
              };
            }
            case 'plugin:updater|download_and_install': {
              const channel = (
                args as
                  | {
                      onEvent?: Channel<DownloadEvent>;
                    }
                  | undefined
              )?.onEvent;

              channel?.onmessage({
                event: 'Started',
                data: {
                  contentLength: 200,
                },
              });
              channel?.onmessage({
                event: 'Progress',
                data: {
                  chunkLength: 50,
                },
              });
              channel?.onmessage({
                event: 'Progress',
                data: {
                  chunkLength: 150,
                },
              });
              channel?.onmessage({
                event: 'Finished',
              });

              return null;
            }
            case 'plugin:resources|close': {
              return null;
            }
            default: {
              throw new Error(`Unexpected command ${command}`);
            }
          }
        });

        const update = await updatesApi.check();

        expect(update?.version).toBe('0.2.0');
        expect(update?.notes).toBe('Faster deck loading');

        await update?.downloadAndInstall({
          onProgress: (progress) => {
            progressUpdates.push(progress);
          },
        });
        await update?.close?.();

        expect(progressUpdates).toEqual([
          {
            downloaded: 0,
            total: 200,
          },
          {
            downloaded: 50,
            total: 200,
          },
          {
            downloaded: 200,
            total: 200,
          },
        ]);
        expect(invocations.map((invocation) => invocation.command)).toEqual([
          'plugin:updater|check',
          'plugin:updater|download_and_install',
          'plugin:resources|close',
        ]);
      });
    });
  });

  describe('.relaunch', () => {
    it('invokes plugin:process|restart', async () => {
      mockIPC((command, args) => {
        invocations.push({
          command,
          args,
        });

        if (command !== 'plugin:process|restart') {
          throw new Error(`Unexpected command ${command}`);
        }

        return null;
      });

      await updatesApi.relaunch();

      expect(invocations.map((invocation) => invocation.command)).toEqual([
        'plugin:process|restart',
      ]);
    });
  });

  describe('.onCheckRequested', () => {
    it('calls the listener when the menu event arrives', async () => {
      const listener = vi.fn();

      mockIPC(() => null, {
        shouldMockEvents: true,
      });

      const stop = await updatesApi.onCheckRequested(listener);

      await emit(checkForUpdatesRequestedEvent);

      expect(listener).toHaveBeenCalledTimes(1);

      stop();
    });
  });
});
