import { type ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import {
  apiPrefix,
  deckStatus,
  type IDeckSummary,
  type TDeckStatus,
} from '../../client/shared';
import type { IDeck } from '../interface';
import { findFreePort } from '../utils/findFreePort';

const firstDeckPort = 3_030;
const startupTimeoutMs = 60_000;
const readinessIntervalMs = 200;
const stopTimeoutMs = 5_000;
const outputLimit = 4_000;

interface IDeckRuntime {
  status: TDeckStatus;
  output: string;
  port?: number;
  error?: string;
  child?: ChildProcess;
  startup?: Promise<void>;
}

type TDeckListener = (summary: IDeckSummary) => void;

interface IDeckServersParams {
  root: string;
  decks: IDeck[];
}

interface IOpenDeckParams {
  id: string;
}

export class DeckServers {
  readonly #root: string;
  readonly #decks: Map<string, IDeck>;
  readonly #runtimes = new Map<string, IDeckRuntime>();
  readonly #listeners = new Set<TDeckListener>();
  #isStopping = false;

  public constructor({ root, decks }: IDeckServersParams) {
    this.#root = root;
    this.#decks = new Map(
      decks.map((deck) => {
        return [deck.id, deck] as const;
      }),
    );
  }

  public has({ id }: IOpenDeckParams): boolean {
    return this.#decks.has(id);
  }

  public summaries(): IDeckSummary[] {
    return [...this.#decks.values()].map((deck) => {
      return this.#toSummary(deck);
    });
  }

  public subscribe(listener: TDeckListener): () => void {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }

  public async open({ id }: IOpenDeckParams): Promise<IDeckSummary> {
    const deck = this.#decks.get(id);

    if (!deck) {
      throw new Error(`Unknown deck "${id}".`);
    }

    const runtime = this.#runtimeOf(id);

    if (runtime.status !== deckStatus.running) {
      runtime.startup ??= this.#start(deck, runtime).finally(() => {
        runtime.startup = undefined;
      });

      await runtime.startup;
    }

    return this.#toSummary(deck);
  }

  public async stopAll(): Promise<void> {
    this.#isStopping = true;

    await Promise.all(
      [...this.#runtimes.values()].map((runtime) => {
        return runtime.child ? stopChild(runtime.child) : undefined;
      }),
    );
  }

  async #start(deck: IDeck, runtime: IDeckRuntime): Promise<void> {
    this.#update(deck, runtime, {
      status: deckStatus.starting,
      output: '',
      error: undefined,
    });

    let child: ChildProcess | undefined;
    let closed: Promise<unknown> | undefined;

    try {
      const bin = this.#resolveSlidevBin();
      const port = await findFreePort({
        from: firstDeckPort,
        exclude: this.#usedPorts(),
      });

      child = spawn(
        process.execPath,
        [bin, deck.entry, '--port', String(port)],
        {
          cwd: deck.dir,
          env: withoutColor(process.env),
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      const started = child;
      const appendOutput = (chunk: Buffer): void => {
        runtime.output = `${runtime.output}${chunk.toString()}`.slice(
          -outputLimit,
        );
      };

      runtime.port = port;
      runtime.child = started;
      closed = once(started, 'close');
      started.stdout?.on('data', appendOutput);
      started.stderr?.on('data', appendOutput);
      started.once('close', (code) => {
        this.#handleClose(deck, runtime, started, code);
      });

      await waitUntilReady(port, started);

      this.#update(deck, runtime, {
        status: deckStatus.running,
      });
    } catch (error) {
      if (child) {
        await stopChild(child);
        await closed;
      }

      this.#update(deck, runtime, {
        status: deckStatus.failed,
        error: [
          error instanceof Error ? error.message : String(error),
          runtime.output.trim(),
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
    }
  }

  #handleClose(
    deck: IDeck,
    runtime: IDeckRuntime,
    child: ChildProcess,
    code: number | null,
  ): void {
    if (runtime.child !== child) {
      return;
    }

    runtime.child = undefined;

    if (this.#isStopping) {
      this.#update(deck, runtime, {
        status: deckStatus.stopped,
      });

      return;
    }

    if (runtime.status === deckStatus.running) {
      this.#update(deck, runtime, {
        status: deckStatus.failed,
        error: [
          `Slidev stopped unexpectedly (exit code ${code}).`,
          runtime.output.trim(),
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
    }
  }

  #resolveSlidevBin(): string {
    const require = createRequire(join(this.#root, 'package.json'));

    try {
      const packagePath = require.resolve('@slidev/cli/package.json');
      const { bin } = JSON.parse(readFileSync(packagePath, 'utf8')) as {
        bin: {
          slidev: string;
        };
      };

      return join(dirname(packagePath), bin.slidev);
    } catch {
      throw new Error(
        `Slidev is not installed in ${this.#root}. Install @slidev/cli at the repository root.`,
      );
    }
  }

  #usedPorts(): Set<number> {
    return new Set(
      [...this.#runtimes.values()].flatMap((runtime) => {
        return runtime.child && runtime.port ? [runtime.port] : [];
      }),
    );
  }

  #runtimeOf(id: string): IDeckRuntime {
    const existing = this.#runtimes.get(id);

    if (existing) {
      return existing;
    }

    const runtime: IDeckRuntime = {
      status: deckStatus.stopped,
      output: '',
    };

    this.#runtimes.set(id, runtime);

    return runtime;
  }

  #update(
    deck: IDeck,
    runtime: IDeckRuntime,
    changes: Partial<IDeckRuntime>,
  ): void {
    Object.assign(runtime, changes);

    const summary = this.#toSummary(deck);

    for (const listener of this.#listeners) {
      listener(summary);
    }
  }

  #toSummary(deck: IDeck): IDeckSummary {
    const runtime = this.#runtimes.get(deck.id);
    const status = runtime?.status ?? deckStatus.stopped;

    return {
      id: deck.id,
      name: deck.name,
      status,
      ...(deck.cover ? { coverUrl: toCoverUrl(deck) } : {}),
      ...(status === deckStatus.running && runtime?.port
        ? { url: `http://localhost:${runtime.port}/` }
        : {}),
      ...(status === deckStatus.failed && runtime?.error
        ? { error: runtime.error }
        : {}),
    };
  }
}

function withoutColor(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const result = {
    ...env,
  };

  result.NO_COLOR = '1';

  return result;
}

function toCoverUrl(deck: IDeck): string | undefined {
  if (deck.cover?.kind === 'url') {
    return deck.cover.url;
  }

  return `${apiPrefix}/decks/${encodeURIComponent(deck.id)}/cover`;
}

async function waitUntilReady(
  port: number,
  child: ChildProcess,
): Promise<void> {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error('Slidev exited before the deck was ready.');
    }

    if (await isResponding(port)) {
      return;
    }

    await sleep(readinessIntervalMs);
  }

  throw new Error(
    `Slidev did not respond within ${startupTimeoutMs / 1_000} seconds.`,
  );
}

async function isResponding(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/`);

    return response.ok;
  } catch {
    return false;
  }
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = new Promise<void>((resolve) => {
    child.once('exit', () => {
      resolve();
    });
  });

  child.kill('SIGTERM');

  const result = await Promise.race([
    exited.then(() => 'exited' as const),
    sleep(stopTimeoutMs, 'timeout' as const),
  ]);

  if (result === 'timeout') {
    child.kill('SIGKILL');
    await exited;
  }
}
