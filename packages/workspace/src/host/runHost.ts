import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import type { IDeckRun } from '@contracts/project';

import { isRecord } from '../utils/isRecord';
import { HostSession } from './HostSession';

export interface IHostRequest {
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export type THostResponse =
  | {
      id: number | null;
      result: unknown;
    }
  | {
      id: number | null;
      error: {
        message: string;
      };
    };

export const hostEvent = {
  deckRun: 'deckRun',
} as const;

export interface IHostEvent {
  event: typeof hostEvent.deckRun;
  data: IDeckRun;
}

export type THostMessage = THostResponse | IHostEvent;

interface IRunHostParams {
  input: Readable;
  output: Writable;
}

export async function runHost({
  input,
  output,
}: IRunHostParams): Promise<void> {
  const send = (message: THostMessage): void => {
    output.write(`${JSON.stringify(message)}\n`);
  };
  const session = new HostSession((run) => {
    send({
      event: hostEvent.deckRun,
      data: run,
    });
  });
  const pending = new Set<Promise<void>>();
  const lines = createInterface({
    input,
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  for await (const line of lines) {
    if (line.trim() === '') {
      continue;
    }

    const request = parseRequest(line);

    if (!request) {
      send({
        id: null,
        error: {
          message: `Not a host request: ${line}`,
        },
      });

      continue;
    }

    const task = handle(session, request)
      .then((result) => {
        send({
          id: request.id,
          result,
        });
      })
      .catch((error: unknown) => {
        send({
          id: request.id,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        });
      })
      .finally(() => {
        pending.delete(task);
      });

    pending.add(task);
  }

  await Promise.all(pending);
  await session.stopAll();
}

async function handle(
  session: HostSession,
  { method, params }: IHostRequest,
): Promise<unknown> {
  switch (method) {
    case 'open': {
      return session.open({
        root: stringParam(method, params, 'root'),
      });
    }
    case 'startDeck': {
      return session.startDeck({
        id: stringParam(method, params, 'id'),
      });
    }
    case 'stopAll': {
      await session.stopAll();

      return null;
    }
    default: {
      throw new Error(`Unknown host method "${method}".`);
    }
  }
}

function stringParam(
  method: string,
  params: Record<string, unknown>,
  name: string,
): string {
  const value = params[name];

  if (typeof value !== 'string') {
    throw new Error(`"${method}" needs a "${name}" string.`);
  }

  return value;
}

function parseRequest(line: string): IHostRequest | null {
  try {
    const data: unknown = JSON.parse(line);

    if (
      !isRecord(data) ||
      typeof data.id !== 'number' ||
      typeof data.method !== 'string'
    ) {
      return null;
    }

    return {
      id: data.id,
      method: data.method,
      params: isRecord(data.params) ? data.params : {},
    };
  } catch {
    return null;
  }
}
