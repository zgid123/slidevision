import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import type { IUpdateManifest } from './publish-update';

export interface IObsoleteFilesParams {
  previous: IUpdateManifest;
  currentKey: string;
}

function folderOf(key: string): string {
  return key.slice(0, key.lastIndexOf('/') + 1);
}

export function obsoleteFiles({
  previous,
  currentKey,
}: IObsoleteFilesParams): string[] {
  const platformFolder = currentKey.slice(0, currentKey.indexOf('/') + 1);
  const currentFolder = folderOf(currentKey);
  const keys = new Set<string>();

  for (const { key, installer } of Object.values(previous.files)) {
    keys.add(key);

    if (installer) {
      keys.add(installer);
    }
  }

  return [...keys].filter((key) => {
    return (
      key.startsWith(platformFolder) &&
      !key.includes('..') &&
      folderOf(key) !== currentFolder
    );
  });
}

function main(): void {
  const { values } = parseArgs({
    options: {
      previous: {
        type: 'string',
      },
      'current-key': {
        type: 'string',
      },
    },
  });
  const { previous, 'current-key': currentKey } = values;

  if (!previous || !currentKey) {
    throw new Error('Usage: --previous --current-key');
  }

  if (!existsSync(previous)) {
    return;
  }

  const keys = obsoleteFiles({
    previous: JSON.parse(readFileSync(previous, 'utf8')) as IUpdateManifest,
    currentKey,
  });

  for (const key of keys) {
    console.log(key);
  }
}

const entry = process.argv[1];

if (entry && import.meta.url === pathToFileURL(entry).href) {
  main();
}
