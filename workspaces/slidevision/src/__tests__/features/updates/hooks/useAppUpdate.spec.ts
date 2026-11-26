import {
  type IAppUpdate,
  useAppUpdate,
} from '#/features/updates/hooks/useAppUpdate';
import {
  type IAvailableUpdate,
  updateStatus,
} from '#/features/updates/interface';

import { FakeUpdatesApi } from '../../../fakes/FakeUpdatesApi';

describe('#useAppUpdate', () => {
  let api: FakeUpdatesApi;
  let update: IAppUpdate;

  beforeEach(() => {
    api = new FakeUpdatesApi();
    update = useAppUpdate({
      api,
    });
  });

  it('starts idle', () => {
    expect(update.state).toEqual({
      status: updateStatus.idle,
    });
  });

  describe('.checkInBackground', () => {
    suite('when no update is available', () => {
      it('stays idle', async () => {
        await update.checkInBackground();

        expect(api.checkCalls).toBe(1);
        expect(update.state).toEqual({
          status: updateStatus.idle,
        });
      });
    });

    suite('when checking fails', () => {
      it('stays idle without surfacing an error', async () => {
        api.checkError = new Error('Network offline');

        await update.checkInBackground();

        expect(update.state).toEqual({
          status: updateStatus.idle,
        });
      });
    });

    suite('when an update is available', () => {
      it('surfaces the available version and notes', async () => {
        api.nextUpdate = {
          version: '0.2.0',
          notes: 'Bug fixes',
          downloadAndInstall: async () => {},
        };

        await update.checkInBackground();

        expect(update.state).toEqual({
          status: updateStatus.available,
          version: '0.2.0',
          notes: 'Bug fixes',
        });
      });
    });
  });

  describe('.check', () => {
    suite('when already on the latest version', () => {
      it('shows checking and then up-to-date', async () => {
        let resolveCheck = (): void => {};

        api.checkGate = new Promise((resolve) => {
          resolveCheck = resolve;
        });

        const checkPromise = update.check();

        expect(update.state).toEqual({
          status: updateStatus.checking,
        });

        resolveCheck();
        await checkPromise;

        expect(update.state).toEqual({
          status: updateStatus.upToDate,
        });
      });
    });

    suite('when a background check is already in flight', () => {
      it('upgrades it to an interactive check without calling check twice', async () => {
        let resolveCheck = (): void => {};

        api.checkGate = new Promise((resolve) => {
          resolveCheck = resolve;
        });

        const backgroundPromise = update.checkInBackground();

        expect(update.state).toEqual({
          status: updateStatus.idle,
        });

        const manualPromise = update.check();

        expect(update.state).toEqual({
          status: updateStatus.checking,
        });

        resolveCheck();
        await Promise.all([backgroundPromise, manualPromise]);

        expect(api.checkCalls).toBe(1);
        expect(update.state).toEqual({
          status: updateStatus.upToDate,
        });
      });
    });

    suite('when checking fails', () => {
      it('reports the failure without install retry', async () => {
        api.checkError = new Error('Server unreachable');

        await update.check();

        expect(update.state).toEqual({
          status: updateStatus.failed,
          message: 'Server unreachable',
          canRetryInstall: false,
        });
      });
    });
  });

  describe('.install', () => {
    it('tracks download progress and relaunches once installed', async () => {
      const seenStates: number[] = [];

      api.nextUpdate = {
        version: '0.2.0',
        notes: null,
        downloadAndInstall: async ({ onProgress }) => {
          onProgress({
            downloaded: 0,
            total: 200,
          });

          if (update.state.status === updateStatus.downloading) {
            seenStates.push(update.state.progress ?? -1);
          }

          onProgress({
            downloaded: 100,
            total: 200,
          });

          if (update.state.status === updateStatus.downloading) {
            seenStates.push(update.state.progress ?? -1);
          }

          onProgress({
            downloaded: 200,
            total: 200,
          });

          if (update.state.status === updateStatus.downloading) {
            seenStates.push(update.state.progress ?? -1);
          }
        },
      };

      await update.check();
      await update.install();

      expect(seenStates).toEqual([0, 50, 100]);
      expect(api.relaunchCalls).toBe(1);
      expect(update.state).toEqual({
        status: updateStatus.ready,
        version: '0.2.0',
      });
    });

    suite('when the total size is unknown', () => {
      it('keeps progress null while downloading', async () => {
        let observedProgress: number | null | undefined;

        api.nextUpdate = {
          version: '0.2.0',
          notes: null,
          downloadAndInstall: async ({ onProgress }) => {
            onProgress({
              downloaded: 64,
              total: null,
            });

            if (update.state.status === updateStatus.downloading) {
              observedProgress = update.state.progress;
            }
          },
        };

        await update.check();
        await update.install();

        expect(observedProgress).toBeNull();
      });
    });

    suite('when installing fails', () => {
      it('allows retrying the install directly', async () => {
        api.nextUpdate = {
          version: '0.2.0',
          notes: null,
          downloadAndInstall: async () => {
            throw new Error('Signature verification failed');
          },
        };

        await update.check();
        await update.install();

        expect(api.relaunchCalls).toBe(0);
        expect(update.state).toEqual({
          status: updateStatus.failed,
          message: 'Signature verification failed',
          canRetryInstall: true,
        });
      });
    });
  });

  describe('.dismiss', () => {
    it('closes any pending update and returns to idle', async () => {
      const close = vi.fn().mockResolvedValue(undefined);
      const available: IAvailableUpdate = {
        version: '0.2.0',
        notes: null,
        downloadAndInstall: async () => {},
        close,
      };

      api.nextUpdate = available;

      await update.check();
      update.dismiss();

      expect(close).toHaveBeenCalledTimes(1);
      expect(update.state).toEqual({
        status: updateStatus.idle,
      });
    });

    suite('while downloading', () => {
      it('ignores dismiss', async () => {
        let releaseDownload = (): void => {};

        api.nextUpdate = {
          version: '0.2.0',
          notes: null,
          downloadAndInstall: () => {
            return new Promise((resolve) => {
              releaseDownload = resolve;
            });
          },
        };

        await update.check();

        const installPromise = update.install();

        update.dismiss();

        expect(update.state.status).toBe(updateStatus.downloading);

        releaseDownload();
        await installPromise;
      });
    });
  });
});
