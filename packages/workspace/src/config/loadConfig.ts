import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isRecord } from '../utils/isRecord';
import { ConfigError } from './ConfigError';

export const configFileName = 'slidevision.json';

export interface IWorkspaceConfig {
  decks: string[];
}

interface ILoadConfigParams {
  root: string;
}

export async function loadConfig({
  root,
}: ILoadConfigParams): Promise<IWorkspaceConfig> {
  const path = join(root, configFileName);
  const text = await readConfigText(path);
  const data = parseJson(path, text);

  if (!isRecord(data) || !isPatternList(data.decks)) {
    throw new ConfigError({
      path,
      problem:
        'expected a "decks" array of glob patterns, for example { "decks": ["decks/*"] }',
    });
  }

  return {
    decks: data.decks,
  };
}

async function readConfigText(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isErrorWithCode(error) && error.code === 'ENOENT') {
      throw new ConfigError({
        path,
        problem:
          'file not found; create it with a "decks" array of glob patterns',
      });
    }

    throw new ConfigError({
      path,
      problem: `cannot be read (${String(error)})`,
    });
  }
}

function parseJson(path: string, text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ConfigError({
      path,
      problem: `is not valid JSON (${error instanceof Error ? error.message : String(error)})`,
    });
  }
}

function isPatternList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' && item.trim() !== '')
  );
}

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
