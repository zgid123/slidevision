import { reactive } from 'vue';

import type { IUpdatesApi } from '../api';
import {
  type IAvailableUpdate,
  type TUpdateState,
  updateStatus,
} from '../interface';

interface IUseAppUpdateParams {
  api: IUpdatesApi;
}

export interface IAppUpdate {
  readonly state: TUpdateState;
  checkInBackground: () => Promise<void>;
  check: () => Promise<void>;
  install: () => Promise<void>;
  dismiss: () => void;
}

export function useAppUpdate({ api }: IUseAppUpdateParams): IAppUpdate {
  const store = reactive<{
    state: TUpdateState;
  }>({
    state: {
      status: updateStatus.idle,
    },
  });

  let pendingUpdate: IAvailableUpdate | null = null;
  let isCheckInFlight = false;
  let isInteractiveCheck = false;

  const releasePending = (): void => {
    if (!pendingUpdate) {
      return;
    }

    const previous = pendingUpdate;
    pendingUpdate = null;

    void previous.close?.();
  };

  const runCheck = async (isInteractive: boolean): Promise<void> => {
    if (
      store.state.status === updateStatus.downloading ||
      store.state.status === updateStatus.ready
    ) {
      return;
    }

    if (isCheckInFlight) {
      if (isInteractive) {
        isInteractiveCheck = true;
        store.state = {
          status: updateStatus.checking,
        };
      }

      return;
    }

    isCheckInFlight = true;
    isInteractiveCheck = isInteractive;

    if (isInteractive) {
      store.state = {
        status: updateStatus.checking,
      };
    }

    try {
      const next = await api.check();

      releasePending();

      if (next) {
        pendingUpdate = next;
        store.state = {
          status: updateStatus.available,
          version: next.version,
          notes: next.notes,
        };
      } else if (isInteractiveCheck) {
        store.state = {
          status: updateStatus.upToDate,
        };
      } else {
        store.state = {
          status: updateStatus.idle,
        };
      }
    } catch (error) {
      if (isInteractiveCheck) {
        store.state = {
          status: updateStatus.failed,
          message: error instanceof Error ? error.message : String(error),
          canRetryInstall: false,
        };
      } else {
        store.state = {
          status: updateStatus.idle,
        };
      }
    } finally {
      isCheckInFlight = false;
      isInteractiveCheck = false;
    }
  };

  const install = async (): Promise<void> => {
    if (
      !pendingUpdate ||
      store.state.status === updateStatus.downloading ||
      store.state.status === updateStatus.ready
    ) {
      return;
    }

    const target = pendingUpdate;

    store.state = {
      status: updateStatus.downloading,
      version: target.version,
      progress: null,
    };

    try {
      await target.downloadAndInstall({
        onProgress: ({ downloaded, total }) => {
          const progress =
            total !== null && total > 0
              ? Math.min(100, Math.round((downloaded / total) * 100))
              : null;

          store.state = {
            status: updateStatus.downloading,
            version: target.version,
            progress,
          };
        },
      });

      store.state = {
        status: updateStatus.ready,
        version: target.version,
      };

      await api.relaunch();
    } catch (error) {
      store.state = {
        status: updateStatus.failed,
        message: error instanceof Error ? error.message : String(error),
        canRetryInstall: true,
      };
    }
  };

  const dismiss = (): void => {
    if (
      store.state.status === updateStatus.checking ||
      store.state.status === updateStatus.downloading
    ) {
      return;
    }

    releasePending();
    store.state = {
      status: updateStatus.idle,
    };
  };

  return {
    get state() {
      return store.state;
    },
    checkInBackground: () => {
      return runCheck(false);
    },
    check: () => {
      return runCheck(true);
    },
    install,
    dismiss,
  };
}
