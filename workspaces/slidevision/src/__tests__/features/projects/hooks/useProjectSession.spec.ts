import { projectKind } from '@contracts/project';

import {
  type IProjectSession,
  screenName,
  useProjectSession,
} from '#/features/projects/hooks/useProjectSession';

import { deckFactory } from '../../../factories/DeckFactory';
import { FakeProjectsApi } from '../../../fakes/FakeProjectsApi';

describe('#useProjectSession', () => {
  let api: FakeProjectsApi;
  let session: IProjectSession;

  beforeEach(() => {
    api = new FakeProjectsApi();
    session = useProjectSession({
      api,
    });
  });

  describe('.open', () => {
    suite('when the folder has a slidevision.json', () => {
      it('shows its decks and remembers the project', async () => {
        const decks = deckFactory.buildList(2);

        api.projects.set('/talks', {
          kind: projectKind.workspace,
          root: '/talks',
          decks,
        });

        await session.open({
          path: '/talks',
        });

        expect(session.screen).toEqual({
          name: screenName.decks,
          project: {
            kind: projectKind.workspace,
            root: '/talks',
            decks,
          },
        });
        expect(session.recent.map((recent) => recent.path)).toEqual(['/talks']);
      });
    });

    suite('when the folder is a single deck', () => {
      it('goes straight to the deck', async () => {
        const deck = deckFactory.build();

        api.projects.set('/solo', {
          kind: projectKind.single,
          root: '/solo',
          deck,
        });

        await session.open({
          path: '/solo',
        });

        expect(session.screen).toEqual(
          expect.objectContaining({
            name: screenName.deck,
            deck,
          }),
        );
      });
    });

    suite('when the folder cannot be opened', () => {
      it('stays on the welcome screen with the error', async () => {
        await session.open({
          path: '/empty',
        });

        expect(session.screen).toEqual({
          name: screenName.welcome,
        });
        expect(session.error).toBe(
          '/empty has no slidevision.json or slides.md.',
        );
      });
    });
  });

  describe('.openFolder', () => {
    suite('when a folder is picked', () => {
      it('opens it', async () => {
        api.pickedFolder = '/solo';
        api.projects.set('/solo', {
          kind: projectKind.single,
          root: '/solo',
          deck: deckFactory.build(),
        });

        await session.openFolder();

        expect(api.openProjectPath).toBe('/solo');
      });
    });

    suite('when the picker is cancelled', () => {
      it('stays on the welcome screen', async () => {
        await session.openFolder();

        expect(session.screen).toEqual({
          name: screenName.welcome,
        });
        expect(api.openProjectPath).toBeNull();
      });
    });
  });

  describe('.back', () => {
    suite('when a deck of a workspace project is shown', () => {
      it('returns to the deck list', async () => {
        const alpha = deckFactory.build();
        const beta = deckFactory.build();

        api.projects.set('/talks', {
          kind: projectKind.workspace,
          root: '/talks',
          decks: [alpha, beta],
        });

        await session.open({
          path: '/talks',
        });

        session.openDeck({
          deck: beta,
        });
        session.back();

        expect(session.screen.name).toBe(screenName.decks);
      });
    });

    suite('when the project is a single deck', () => {
      it('stays on the deck', async () => {
        api.projects.set('/solo', {
          kind: projectKind.single,
          root: '/solo',
          deck: deckFactory.build(),
        });

        await session.open({
          path: '/solo',
        });

        session.back();

        expect(session.screen.name).toBe(screenName.deck);
      });
    });
  });

  describe('.close', () => {
    it('closes the project and shows the welcome screen', async () => {
      api.projects.set('/solo', {
        kind: projectKind.single,
        root: '/solo',
        deck: deckFactory.build(),
      });

      await session.open({
        path: '/solo',
      });
      await session.close();

      expect(api.isClosed).toBe(true);
      expect(session.screen).toEqual({
        name: screenName.welcome,
      });
    });
  });

  describe('.removeRecent', () => {
    it('drops the project from the recent list', async () => {
      api.recent = [
        {
          path: '/gone',
          name: 'gone',
          openedAt: 1,
          isAvailable: false,
        },
      ];

      await session.load();
      await session.removeRecent({
        path: '/gone',
      });

      expect(session.recent).toEqual([]);
    });
  });
});
