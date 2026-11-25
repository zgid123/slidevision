import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

import { isRecord } from '../utils/isRecord';
import { openProject } from './openProject';

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

interface IRunHostParams {
  input: Readable;
  output: Writable;
}

export async function runHost({
  input,
  output,
}: IRunHostParams): Promise<void> {
  const send = (response: THostResponse): void => {
    output.write(`${JSON.stringify(response)}\n`);
  };
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

    const task = handle(request)
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
}

async function handle({ method, params }: IHostRequest): Promise<unknown> {
  switch (method) {
    case 'open': {
      if (typeof params.root !== 'string') {
        throw new Error('"open" needs a "root" folder path.');
      }

      return openProject({
        root: params.root,
      });
    }
    default: {
      throw new Error(`Unknown host method "${method}".`);
    }
  }
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
