import { mount } from '@vue/test-utils';

import DeckCard from '#/features/decks/components/DeckCard.vue';
import DeckList from '#/features/decks/components/DeckList.vue';

import { deckFactory } from '../../../factories/DeckFactory';

describe('#DeckList', () => {
  suite('when there are no decks', () => {
    it('explains how to add one', () => {
      const wrapper = mount(DeckList, {
        props: {
          decks: [],
        },
      });

      expect(wrapper.text()).toContain('No decks found');
      expect(wrapper.text()).toContain('slidevision.json');
    });
  });

  suite('when there are decks', () => {
    it('shows a card for each deck in order', () => {
      const decks = deckFactory.buildList(3);
      const wrapper = mount(DeckList, {
        props: {
          decks,
        },
      });

      const ids = wrapper.findAll('[data-deck-id]').map((card) => {
        return card.attributes('data-deck-id');
      });

      expect(ids).toEqual(
        decks.map((deck) => {
          return deck.id;
        }),
      );
    });
  });

  suite('when a card is opened', () => {
    it('emits open with that deck', async () => {
      const decks = deckFactory.buildList(2);
      const wrapper = mount(DeckList, {
        props: {
          decks,
        },
      });

      await wrapper.findAllComponents(DeckCard)[1]?.trigger('click');

      expect(wrapper.emitted('open')).toEqual([[decks[1]]]);
    });
  });
});
