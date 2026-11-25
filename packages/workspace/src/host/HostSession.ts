import {
  type IDeck,
  type IDeckRun,
  projectKind,
  type TProject,
} from '@contracts/project';

import type { IDeckSummary } from '../../client/shared';
import { DeckServers } from '../server/DeckServers';
import { openProject } from './openProject';

type TDeckRunListener = (run: IDeckRun) => void;

interface IOpenParams {
  root: string;
}

interface IDeckParams {
  id: string;
}

interface IOpenedProject {
  decks: Map<string, IDeck>;
  servers: DeckServers;
  unsubscribe: () => void;
}

export class HostSession {
  readonly #onDeckRun: TDeckRunListener;
  #project?: IOpenedProject;

  public constructor(onDeckRun: TDeckRunListener) {
    this.#onDeckRun = onDeckRun;
  }

  public async open({ root }: IOpenParams): Promise<TProject> {
    const project = await openProject({
      root,
    });
    const decks =
      project.kind === projectKind.workspace ? project.decks : [project.deck];
    const servers = new DeckServers({
      root,
      decks,
    });

    await this.stopAll();

    this.#project = {
      decks: new Map(
        decks.map((deck) => {
          return [deck.id, deck] as const;
        }),
      ),
      servers,
      unsubscribe: servers.subscribe((summary) => {
        this.#onDeckRun(toDeckRun(summary));
      }),
    };

    return project;
  }

  public async startDeck({ id }: IDeckParams): Promise<IDeckRun> {
    const { servers } = this.#opened();

    this.#deckOf(id);

    return toDeckRun(
      await servers.open({
        id,
      }),
    );
  }

  public async stopAll(): Promise<void> {
    const project = this.#project;

    this.#project = undefined;

    if (project) {
      project.unsubscribe();
      await project.servers.stopAll();
    }
  }

  #opened(): IOpenedProject {
    if (!this.#project) {
      throw new Error('No project is open.');
    }

    return this.#project;
  }

  #deckOf(id: string): IDeck {
    const deck = this.#opened().decks.get(id);

    if (!deck) {
      throw new Error(`Unknown deck "${id}".`);
    }

    return deck;
  }
}

function toDeckRun({ id, status, url, error }: IDeckSummary): IDeckRun {
  return {
    id,
    status,
    ...(url ? { url } : {}),
    ...(error ? { error } : {}),
  };
}
