import { deckStatus } from '@contracts/project';

import {
  slidesState,
  useDeckSlides,
} from '#/features/decks/hooks/useDeckSlides';

import { deckFactory } from '../../../factories/DeckFactory';
import { FakeDecksApi } from '../../../fakes/FakeDecksApi';

describe('#useDeckSlides', () => {
  let api: FakeDecksApi;

  beforeEach(() => {
    api = new FakeDecksApi();
  });

  describe('.start', () => {
    suite('when the deck starts', () => {
      it('is ready at the deck URL with the first slide selected', async () => {
        const deck = deckFactory.build();
        const subject = useDeckSlides({
          api: api.running(deck.id),
          deck,
        });

        await subject.start();

        expect(subject.view).toEqual({
          state: slidesState.ready,
          url: 'http://localhost:3030/',
          selected: 1,
        });
      });
    });

    suite('when Slidev fails to start the deck', () => {
      it('shows Slidev output', async () => {
        const deck = deckFactory.build();
        const subject = useDeckSlides({
          api: api.failing(deck.id, 'Theme "missing" was not found'),
          deck,
        });

        await subject.start();

        expect(subject.view).toEqual({
          state: slidesState.failed,
          error: 'Theme "missing" was not found',
        });
      });
    });

    suite('when the host cannot start the deck', () => {
      it('shows the host error', async () => {
        const deck = deckFactory.build();
        const subject = useDeckSlides({
          api,
          deck,
        });

        await subject.start();

        expect(subject.view).toEqual({
          state: slidesState.failed,
          error: `Unknown deck "${deck.id}".`,
        });
      });
    });

    suite('when started again after a failure is fixed', () => {
      it('is ready', async () => {
        const deck = deckFactory.build();
        const subject = useDeckSlides({
          api: api.failing(deck.id, 'broken'),
          deck,
        });

        await subject.start();
        api.running(deck.id);
        await subject.start();

        expect(subject.view.state).toBe(slidesState.ready);
        expect(api.startedDecks).toEqual([deck.id, deck.id]);
      });
    });
  });

  suite('when Slidev stops while the slides are shown', () => {
    it('shows the failure for this deck only', async () => {
      const deck = deckFactory.build();
      const other = deckFactory.build();
      const subject = useDeckSlides({
        api: api.running(deck.id),
        deck,
      });

      await subject.start();
      api.emit({
        id: other.id,
        status: deckStatus.failed,
        error: 'other deck',
      });

      expect(subject.view.state).toBe(slidesState.ready);

      api.emit({
        id: deck.id,
        status: deckStatus.failed,
        error: 'Slidev stopped unexpectedly (exit code 1).',
      });

      expect(subject.view).toEqual({
        state: slidesState.failed,
        error: 'Slidev stopped unexpectedly (exit code 1).',
      });
    });
  });

  describe('.select', () => {
    it('selects the slide', async () => {
      const deck = deckFactory.build();
      const subject = useDeckSlides({
        api: api.running(deck.id),
        deck,
      });

      await subject.start();
      subject.select({
        no: 3,
      });

      expect(subject.view).toEqual(
        expect.objectContaining({
          selected: 3,
        }),
      );
    });
  });

  describe('.stop', () => {
    it('stops listening for deck status', async () => {
      const deck = deckFactory.build();
      const subject = useDeckSlides({
        api: api.running(deck.id),
        deck,
      });

      await subject.start();
      subject.stop();

      expect(api.listeners.size).toBe(0);
    });
  });
});
