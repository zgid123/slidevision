import { glob, readFile, stat } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';

import type { IDeck, TDeckCover } from '../interface';
import { readHeadmatter } from './readHeadmatter';

const entryFileName = 'slides.md';
const remoteUrlPattern = /^https?:\/\//i;

interface IFindDecksParams {
  root: string;
  patterns: string[];
}

export async function findDecks({
  root,
  patterns,
}: IFindDecksParams): Promise<IDeck[]> {
  const folders = new Set<string>();

  for (const pattern of patterns) {
    const matches = glob(pattern, {
      cwd: root,
      exclude: (path) => basename(path) === 'node_modules',
    });

    for await (const match of matches) {
      folders.add(resolve(root, match));
    }
  }

  const decks = await Promise.all(
    [...folders].map((dir) => {
      return readDeck(root, dir);
    }),
  );

  return decks
    .filter((deck): deck is IDeck => deck !== null)
    .sort((left, right) => {
      return left.id.localeCompare(right.id);
    });
}

async function readDeck(root: string, dir: string): Promise<IDeck | null> {
  const entry = join(dir, entryFileName);

  if (!(await isFile(entry))) {
    return null;
  }

  const headmatter = readHeadmatter({
    source: await readFile(entry, 'utf8'),
  });
  const title =
    typeof headmatter.title === 'string' ? headmatter.title.trim() : '';
  const cover = await resolveCover(dir, headmatter.background);

  return {
    id: relative(root, dir).split(sep).join('/'),
    name: title || basename(dir),
    dir,
    entry,
    ...(cover ? { cover } : {}),
  };
}

async function resolveCover(
  dir: string,
  background: unknown,
): Promise<TDeckCover | undefined> {
  if (typeof background !== 'string' || background.trim() === '') {
    return undefined;
  }

  if (remoteUrlPattern.test(background)) {
    return {
      kind: 'url',
      url: background,
    };
  }

  const path = background.startsWith('/')
    ? join(dir, 'public', background)
    : resolve(dir, background);

  if (!(await isFile(path))) {
    return undefined;
  }

  return {
    kind: 'file',
    path,
  };
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}
