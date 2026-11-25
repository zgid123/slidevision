import { clearMocks, mockConvertFileSrc } from '@tauri-apps/api/mocks';
import { mount } from '@vue/test-utils';

import DeckCard from '#/features/decks/components/DeckCard.vue';

import { deckFactory } from '../../../factories/DeckFactory';

describe('#DeckCard', () => {
  beforeEach(() => {
    mockConvertFileSrc('macos');
  });

  afterEach(() => {
    clearMocks();
  });

  suite('when the deck has a file cover', () => {
    it('shows the cover through the asset protocol', () => {
      const deck = deckFactory.withFileCover().build();
      const wrapper = mount(DeckCard, {
        props: {
          deck,
        },
      });

      const image = wrapper.get('img');

      expect(image.attributes('src')).toBe(
        'asset://localhost/%2Ftalks%2Fdecks%2Fassets%2Fcover.png',
      );
      expect(image.attributes('alt')).toBe(`Cover of ${deck.name}`);
    });
  });

  suite('when the deck has a URL cover', () => {
    it('shows the cover from the URL', () => {
      const deck = deckFactory.withUrlCover().build();
      const wrapper = mount(DeckCard, {
        props: {
          deck,
        },
      });

      expect(wrapper.get('img').attributes('src')).toBe(
        deck.cover?.kind === 'url' ? deck.cover.url : '',
      );
    });
  });

  suite('when the deck has no cover', () => {
    it('shows a title card instead', () => {
      const deck = deckFactory.build();
      const wrapper = mount(DeckCard, {
        props: {
          deck,
        },
      });

      expect(wrapper.find('img').exists()).toBe(false);
      expect(wrapper.text()).toContain(deck.name);
    });
  });

  suite('when the cover fails to load', () => {
    it('falls back to the title card', async () => {
      const deck = deckFactory.withFileCover().build();
      const wrapper = mount(DeckCard, {
        props: {
          deck,
        },
      });

      await wrapper.get('img').trigger('error');

      expect(wrapper.find('img').exists()).toBe(false);
      expect(wrapper.text()).toContain(deck.name);
    });
  });

  suite('when the card is clicked', () => {
    it('emits open', async () => {
      const wrapper = mount(DeckCard, {
        props: {
          deck: deckFactory.build(),
        },
      });

      await wrapper.get('button').trigger('click');

      expect(wrapper.emitted('open')).toHaveLength(1);
    });
  });
});
