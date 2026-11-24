import { join } from 'node:path';

import { findDecks } from '../../utils/findDecks';
import { deckFactory, pngBytes } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

describe('#findDecks', () => {
  let workspace: ITestWorkspace;

  afterEach(async () => {
    await removeWorkspace(workspace);
  });

  suite('when matched folders include one without slides.md', () => {
    it('returns only the folders with slides.md, named from their title', async () => {
      const alpha = deckFactory.build({
        folder: 'decks/alpha',
      });
      const beta = deckFactory.build({
        folder: 'decks/beta',
      });

      workspace = await workspaceFactory.create({
        decks: [alpha, beta],
        files: {
          'decks/notes/README.md': '# Notes',
        },
      });

      const decks = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(decks).toEqual([
        {
          id: 'decks/alpha',
          name: alpha.title,
          dir: join(workspace.root, 'decks/alpha'),
          entry: join(workspace.root, 'decks/alpha/slides.md'),
        },
        {
          id: 'decks/beta',
          name: beta.title,
          dir: join(workspace.root, 'decks/beta'),
          entry: join(workspace.root, 'decks/beta/slides.md'),
        },
      ]);
    });
  });

  suite('when a deck has no title', () => {
    it('names the deck after its folder', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.untitled().build({
            folder: 'decks/untitled-talk',
          }),
        ],
      });

      const [deck] = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(deck?.name).toEqual('untitled-talk');
    });
  });

  suite('when background points to an existing file', () => {
    it('uses that file as the cover', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.withCover().build({
            folder: 'decks/alpha',
          }),
        ],
      });

      const [deck] = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(deck?.cover).toEqual({
        kind: 'file',
        path: join(workspace.root, 'decks/alpha/assets/main.png'),
      });
    });
  });

  suite('when background starts with a slash', () => {
    it('resolves the cover from the deck public folder', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
            background: '/main.png',
            files: {
              'public/main.png': pngBytes,
            },
          }),
        ],
      });

      const [deck] = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(deck?.cover).toEqual({
        kind: 'file',
        path: join(workspace.root, 'decks/alpha/public/main.png'),
      });
    });
  });

  suite('when background points to a missing file', () => {
    it('leaves the deck without a cover', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            background: './assets/missing.png',
          }),
        ],
      });

      const [deck] = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(deck?.cover).toBeUndefined();
    });
  });

  suite('when background is a remote URL', () => {
    it('uses the URL as the cover', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            background: 'https://example.com/cover.png',
          }),
        ],
      });

      const [deck] = await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      });

      expect(deck?.cover).toEqual({
        kind: 'url',
        url: 'https://example.com/cover.png',
      });
    });
  });

  suite('when patterns overlap', () => {
    it('lists each deck once', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
          }),
        ],
      });

      const decks = await findDecks({
        root: workspace.root,
        patterns: ['decks/*', 'decks/alpha'],
      });

      expect(decks.map((deck) => deck.id)).toEqual(['decks/alpha']);
    });
  });

  suite('when a recursive pattern reaches node_modules', () => {
    it('skips folders inside node_modules', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'talks/alpha',
          }),
          deckFactory.build({
            folder: 'node_modules/some-theme/example',
          }),
        ],
      });

      const decks = await findDecks({
        root: workspace.root,
        patterns: ['**'],
      });

      expect(decks.map((deck) => deck.id)).toEqual(['talks/alpha']);
    });
  });

  suite('when no folder matches', () => {
    it('returns an empty list', async () => {
      workspace = await workspaceFactory.create({
        decks: [
          deckFactory.build({
            folder: 'decks/alpha',
          }),
        ],
      });

      const decks = await findDecks({
        root: workspace.root,
        patterns: ['talks/*'],
      });

      expect(decks).toEqual([]);
    });
  });
});
