import { deckStatus, type IDeck, type IDeckRun } from '@contracts/project';
import { reactive } from 'vue';

import type { IDecksApi } from '../api';

export const slidesState = {
  loading: 'loading',
  failed: 'failed',
  ready: 'ready',
} as const;

export type TSlidesView =
  | {
      state: typeof slidesState.loading;
    }
  | {
      state: typeof slidesState.failed;
      error: string;
    }
  | {
      state: typeof slidesState.ready;
      url: string;
      selected: number;
    };

interface ISelectParams {
  no: number;
}

export interface IDeckSlides {
  readonly view: TSlidesView;
  start: () => Promise<void>;
  select: (params: ISelectParams) => void;
  stop: () => void;
}

interface IUseDeckSlidesParams {
  api: IDecksApi;
  deck: IDeck;
}

interface IDeckSlidesState {
  view: TSlidesView;
}

const firstSlide = 1;

export function useDeckSlides({
  api,
  deck,
}: IUseDeckSlidesParams): IDeckSlides {
  const state = reactive<IDeckSlidesState>({
    view: {
      state: slidesState.loading,
    },
  });
  let stopListening: (() => void) | undefined;
  let isStopped = false;

  const fail = (error: unknown): void => {
    state.view = {
      state: slidesState.failed,
      error: error instanceof Error ? error.message : String(error),
    };
  };

  const onDeckRun = (run: IDeckRun): void => {
    if (run.id !== deck.id || run.status !== deckStatus.failed) {
      return;
    }

    fail(run.error ?? `${deck.name} stopped.`);
  };

  return {
    get view() {
      return state.view;
    },
    start: async () => {
      state.view = {
        state: slidesState.loading,
      };

      try {
        stopListening ??= await api.onDeckRun(onDeckRun);

        if (isStopped) {
          stopListening();

          return;
        }

        const run = await api.startDeck({
          id: deck.id,
        });

        if (run.status !== deckStatus.running || !run.url) {
          fail(run.error ?? `${deck.name} did not start.`);

          return;
        }

        state.view = {
          state: slidesState.ready,
          url: run.url,
          selected: firstSlide,
        };
      } catch (error) {
        fail(error);
      }
    },
    select: ({ no }) => {
      const { view } = state;

      if (view.state === slidesState.ready) {
        view.selected = no;
      }
    },
    stop: () => {
      isStopped = true;
      stopListening?.();
    },
  };
}
