import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Factory } from 'fishery';

import type { ITestDeck } from './DeckFactory';

const repositoryNodeModules = fileURLToPath(
  new URL('../../../../../node_modules', import.meta.url),
);

export interface ITestWorkspace {
  root: string;
  config: string | null;
  decks: ITestDeck[];
  files: Record<string, string | Uint8Array>;
  hasSlidev: boolean;
}

class WorkspaceFactory extends Factory<ITestWorkspace> {
  withPatterns(patterns: string[]): this {
    return this.params({
      config: JSON.stringify({
        decks: patterns,
      }),
    });
  }

  withConfig(config: string): this {
    return this.params({
      config,
    });
  }

  withSlidev(): this {
    return this.params({
      hasSlidev: true,
    });
  }

  withoutConfig(): this {
    return this.params({
      config: null,
    });
  }
}

export const workspaceFactory = WorkspaceFactory.define(
  ({ params, onCreate }) => {
    onCreate(async (workspace) => {
      const root = await realpath(
        await mkdtemp(join(tmpdir(), 'slidevision-')),
      );

      await writeFiles(root, toFiles(workspace));

      if (workspace.hasSlidev) {
        await symlink(repositoryNodeModules, join(root, 'node_modules'), 'dir');
      }

      return {
        ...workspace,
        root,
      };
    });

    const {
      root = '',
      config = JSON.stringify({
        decks: ['decks/*'],
      }),
      decks = [],
      files = {},
      hasSlidev = false,
      ...workspace
    } = params;

    return {
      root,
      config,
      decks: decks as ITestDeck[],
      files: files as ITestWorkspace['files'],
      hasSlidev,
      ...workspace,
    };
  },
);

interface IRemoveWorkspaceParams {
  root: string;
}

export async function removeWorkspace({
  root,
}: IRemoveWorkspaceParams): Promise<void> {
  await rm(root, {
    recursive: true,
    force: true,
  });
}

function toFiles(
  workspace: ITestWorkspace,
): Record<string, string | Uint8Array> {
  const files: Record<string, string | Uint8Array> = {
    ...workspace.files,
  };

  if (workspace.config !== null) {
    files['slidevision.json'] = workspace.config;
  }

  for (const deck of workspace.decks) {
    files[`${deck.folder}/slides.md`] = toSlidesSource(deck);

    for (const [path, content] of Object.entries(deck.files)) {
      files[`${deck.folder}/${path}`] = content;
    }
  }

  return files;
}

function toSlidesSource(deck: ITestDeck): string {
  const headmatter = [
    ...(deck.title === null ? [] : [`title: '${deck.title}'`]),
    `theme: ${deck.theme}`,
    ...(deck.background === undefined
      ? []
      : [`background: ${deck.background}`]),
  ];

  return ['---', ...headmatter, '---', '', '# First slide', ''].join('\n');
}

async function writeFiles(
  root: string,
  files: Record<string, string | Uint8Array>,
): Promise<void> {
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(root, path);

    await mkdir(dirname(fullPath), {
      recursive: true,
    });
    await writeFile(fullPath, content);
  }
}
