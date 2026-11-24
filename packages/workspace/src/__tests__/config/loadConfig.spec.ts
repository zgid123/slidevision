import { join } from 'node:path';

import { ConfigError } from '../../config/ConfigError';
import { loadConfig } from '../../config/loadConfig';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

describe('#loadConfig', () => {
  let workspace: ITestWorkspace;

  afterEach(async () => {
    await removeWorkspace(workspace);
  });

  suite('when slidevision.json lists glob patterns', () => {
    it('returns the patterns', async () => {
      workspace = await workspaceFactory
        .withPatterns(['decks/*', 'talks/**'])
        .create();

      const config = await loadConfig({
        root: workspace.root,
      });

      expect(config).toEqual({
        decks: ['decks/*', 'talks/**'],
      });
    });
  });

  suite('when slidevision.json is missing', () => {
    it('rejects with an error naming the file', async () => {
      workspace = await workspaceFactory.withoutConfig().create();

      const result = loadConfig({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        new ConfigError({
          path: join(workspace.root, 'slidevision.json'),
          problem:
            'file not found; create it with a "decks" array of glob patterns',
        }),
      );
    });
  });

  suite('when slidevision.json is not valid JSON', () => {
    it('rejects with a JSON error naming the file', async () => {
      workspace = await workspaceFactory.withConfig('{ "decks": [').create();

      const result = loadConfig({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        `${join(workspace.root, 'slidevision.json')}: is not valid JSON`,
      );
    });
  });

  suite('when slidevision.json has no decks list', () => {
    it('rejects with an error describing the expected shape', async () => {
      workspace = await workspaceFactory
        .withConfig('{ "packages": ["decks/*"] }')
        .create();

      const result = loadConfig({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        'expected a "decks" array of glob patterns',
      );
    });
  });

  suite('when the decks list contains something other than a pattern', () => {
    it('rejects with an error describing the expected shape', async () => {
      workspace = await workspaceFactory
        .withConfig('{ "decks": ["decks/*", 42] }')
        .create();

      const result = loadConfig({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        'expected a "decks" array of glob patterns',
      );
    });
  });
});
