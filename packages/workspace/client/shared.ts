import type { TDeckStatus } from '@contracts/project';

export { deckStatus, type TDeckStatus } from '@contracts/project';

export const apiPrefix = '/__slidevision/api';

export const deckStatusEvent = 'slidevision:deck-status';

export interface IDeckSummary {
  id: string;
  name: string;
  status: TDeckStatus;
  coverUrl?: string;
  url?: string;
  error?: string;
}
