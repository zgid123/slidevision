export const apiPrefix = '/__slidevision/api';

export const deckStatusEvent = 'slidevision:deck-status';

export const deckStatus = {
  stopped: 'stopped',
  starting: 'starting',
  running: 'running',
  failed: 'failed',
} as const;

export type TDeckStatus = (typeof deckStatus)[keyof typeof deckStatus];

export interface IDeckSummary {
  id: string;
  name: string;
  status: TDeckStatus;
  coverUrl?: string;
  url?: string;
  error?: string;
}
