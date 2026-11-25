import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { projectKind, type TProject } from '@contracts/project';

import { configFileName, loadConfig } from '../config/loadConfig';
import { findDecks, readDeck } from '../utils/findDecks';
import { ProjectError } from './ProjectError';

interface IOpenProjectParams {
  root: string;
}

export async function openProject({
  root,
}: IOpenProjectParams): Promise<TProject> {
  if (await exists(join(root, configFileName))) {
    const config = await loadConfig({
      root,
    });
    const decks = await findDecks({
      root,
      patterns: config.decks,
    });

    return {
      kind: projectKind.workspace,
      root,
      decks,
    };
  }

  const deck = await readDeck({
    root,
    dir: root,
  });

  if (!deck) {
    throw ProjectError.missingEntry({
      root,
    });
  }

  return {
    kind: projectKind.single,
    root,
    deck,
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);

    return true;
  } catch {
    return false;
  }
}
