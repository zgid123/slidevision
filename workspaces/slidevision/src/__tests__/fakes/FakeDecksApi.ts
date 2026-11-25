import { deckStatus, type IDeckRun } from '@contracts/project';

import type { IDecksApi } from '#/features/decks/api';

interface IDeckIdParams {
  id: string;
}

type TDeckRunListener = (run: IDeckRun) => void;

export class FakeDecksApi implements IDecksApi {
  public readonly runs = new Map<string, IDeckRun>();
  public readonly listeners = new Set<TDeckRunListener>();
  public startedDecks: string[] = [];

  public startDeck = async ({ id }: IDeckIdParams): Promise<IDeckRun> => {
    this.startedDecks.push(id);

    const run = this.runs.get(id);

    if (!run) {
      throw new Error(`Unknown deck "${id}".`);
    }

    return run;
  };

  public onDeckRun = async (
    listener: TDeckRunListener,
  ): Promise<() => void> => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public running(id: string): this {
    this.runs.set(id, {
      id,
      status: deckStatus.running,
      url: 'http://localhost:3030/',
    });

    return this;
  }

  public failing(id: string, error: string): this {
    this.runs.set(id, {
      id,
      status: deckStatus.failed,
      error,
    });

    return this;
  }

  public emit(run: IDeckRun): void {
    for (const listener of this.listeners) {
      listener(run);
    }
  }
}
