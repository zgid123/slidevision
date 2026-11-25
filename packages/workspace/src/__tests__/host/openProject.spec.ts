import { join } from 'node:path';
import { projectKind } from '@contracts/project';

import { openProject } from '../../host/openProject';
import { deckFactory } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

describe('#openProject', () => {
  let workspace: ITestWorkspace;

  afterEach(async () => {
    await removeWorkspace(workspace);
  });

  suite('when the folder has a slidevision.json', () => {
    it('returns the decks its patterns match', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
            title: 'Alpha',
          }),
          deckFactory.build({
            folder: 'decks/beta',
            title: 'Beta',
          }),
        ],
        files: {
          'slides.md': '# Root deck is ignored with a config\n',
        },
      });

      const project = await openProject({
        root: workspace.root,
      });

      expect(project).toEqual({
        kind: projectKind.workspace,
        root: workspace.root,
        decks: [
          expect.objectContaining({
            id: 'decks/alpha',
            name: 'Alpha',
          }),
          expect.objectContaining({
            id: 'decks/beta',
            name: 'Beta',
          }),
        ],
      });
    });
  });

  suite('when slidevision.json is malformed', () => {
    it('rejects with the config error', async () => {
      workspace = await workspaceFactory.withConfig('{ "decks": [').create();

      const result = openProject({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        `${join(workspace.root, 'slidevision.json')}: is not valid JSON`,
      );
    });
  });

  suite('when the folder has only a slides.md', () => {
    it('returns the folder as the single deck', async () => {
      workspace = await workspaceFactory.withoutConfig().create({
        files: {
          'slides.md': "---\ntitle: 'Solo talk'\n---\n\n# First slide\n",
        },
      });

      const project = await openProject({
        root: workspace.root,
      });

      expect(project).toEqual({
        kind: projectKind.single,
        root: workspace.root,
        deck: {
          id: '.',
          name: 'Solo talk',
          dir: workspace.root,
          entry: join(workspace.root, 'slides.md'),
        },
      });
    });
  });

  suite('when the folder has neither file', () => {
    it('rejects with a message naming both files', async () => {
      workspace = await workspaceFactory.withoutConfig().create();

      const result = openProject({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        `${workspace.root} has no slidevision.json or slides.md.`,
      );
    });
  });

  suite('when the only slides.md is in a subfolder', () => {
    it('rejects without searching subfolders', async () => {
      workspace = await workspaceFactory.withoutConfig().create({
        decks: [
          deckFactory.build({
            folder: 'talk',
          }),
        ],
      });

      const result = openProject({
        root: workspace.root,
      });

      await expect(result).rejects.toThrow(
        `${workspace.root} has no slidevision.json or slides.md.`,
      );
    });
  });
});
