export const updateStatus = {
  idle: 'idle',
  checking: 'checking',
  upToDate: 'up-to-date',
  available: 'available',
  downloading: 'downloading',
  ready: 'ready',
  failed: 'failed',
} as const;

export type TUpdateStatus = (typeof updateStatus)[keyof typeof updateStatus];

export interface IUpdateProgress {
  downloaded: number;
  total: number | null;
}

export interface IDownloadAndInstallParams {
  onProgress: (progress: IUpdateProgress) => void;
}

export interface IAvailableUpdate {
  version: string;
  notes: string | null;
  downloadAndInstall: (params: IDownloadAndInstallParams) => Promise<void>;
  close?: () => Promise<void>;
}

export type TUpdateState =
  | {
      status: typeof updateStatus.idle;
    }
  | {
      status: typeof updateStatus.checking;
    }
  | {
      status: typeof updateStatus.upToDate;
    }
  | {
      status: typeof updateStatus.available;
      version: string;
      notes: string | null;
    }
  | {
      status: typeof updateStatus.downloading;
      version: string;
      progress: number | null;
    }
  | {
      status: typeof updateStatus.ready;
      version: string;
    }
  | {
      status: typeof updateStatus.failed;
      message: string;
      canRetryInstall: boolean;
    };
