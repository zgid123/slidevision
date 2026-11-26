import { listen } from '@tauri-apps/api/event';
import { relaunch } from '@tauri-apps/plugin-process';
import { check } from '@tauri-apps/plugin-updater';

import type { IAvailableUpdate } from './interface';

export interface IUpdatesApi {
  check: () => Promise<IAvailableUpdate | null>;
  relaunch: () => Promise<void>;
  onCheckRequested: (listener: () => void) => Promise<() => void>;
}

export const checkForUpdatesRequestedEvent = 'check-for-updates-requested';

export const updatesApi: IUpdatesApi = {
  check: async () => {
    const update = await check();

    if (!update) {
      return null;
    }

    return {
      version: update.version,
      notes: update.body ?? null,
      downloadAndInstall: async ({ onProgress }) => {
        let downloaded = 0;
        let total: number | null = null;

        await update.downloadAndInstall((event) => {
          if (event.event === 'Started') {
            total = event.data.contentLength ?? null;

            onProgress({
              downloaded,
              total,
            });
          } else if (event.event === 'Progress') {
            downloaded += event.data.chunkLength;

            onProgress({
              downloaded,
              total,
            });
          }
        });
      },
      close: () => {
        return update.close();
      },
    };
  },
  relaunch: () => {
    return relaunch();
  },
  onCheckRequested: (listener) => {
    return listen(checkForUpdatesRequestedEvent, listener);
  },
};
