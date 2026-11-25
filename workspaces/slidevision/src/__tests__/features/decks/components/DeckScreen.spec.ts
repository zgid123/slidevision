import { mount } from '@vue/test-utils';

import DeckScreen from '#/features/decks/components/DeckScreen.vue';

import { deckFactory } from '../../../factories/DeckFactory';

describe('#DeckScreen', () => {
  suite('when the deck belongs to a workspace project', () => {
    it('shows a back button that emits back', async () => {
      const wrapper = mount(DeckScreen, {
        props: {
          deck: deckFactory.build(),
          canGoBack: true,
        },
      });

      await wrapper.get('button').trigger('click');

      expect(wrapper.emitted('back')).toHaveLength(1);
    });
  });

  suite('when the deck is the whole project', () => {
    it('shows no back button', () => {
      const wrapper = mount(DeckScreen, {
        props: {
          deck: deckFactory.build(),
          canGoBack: false,
        },
      });

      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  it('shows the deck name and entry file', () => {
    const deck = deckFactory.build();
    const wrapper = mount(DeckScreen, {
      props: {
        deck,
        canGoBack: false,
      },
    });

    expect(wrapper.get('h2').text()).toBe(deck.name);
    expect(wrapper.text()).toContain(deck.entry);
  });
});
