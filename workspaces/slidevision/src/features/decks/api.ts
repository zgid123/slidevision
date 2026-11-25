import type { IDeckRun } from '@contracts/project';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface IDeckIdParams {
  id: string;
}

export interface IDecksApi {
  startDeck: (params: IDeckIdParams) => Promise<IDeckRun>;
  onDeckRun: (listener: (run: IDeckRun) => void) => Promise<() => void>;
}

export const deckRunEvent = 'deck-run';

export const decksApi: IDecksApi = {
  startDeck: ({ id }) => {
    return invoke('start_deck', {
      id,
    });
  },
  onDeckRun: (listener) => {
    return listen<IDeckRun>(deckRunEvent, (event) => {
      listener(event.payload);
    });
  },
};
