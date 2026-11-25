import { deckStatus, type IDeckRun } from '@contracts/project';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { flushPromises, mount } from '@vue/test-utils';

import DeckScreen from '#/features/decks/components/DeckScreen.vue';

import { deckFactory } from '../../../factories/DeckFactory';

describe('#DeckScreen', () => {
  let run: IDeckRun;
  let startedDecks: string[];

  beforeEach(() => {
    startedDecks = [];
    mockIPC(
      (command, args) => {
        if (command !== 'start_deck') {
          throw new Error(`Unexpected command ${command}`);
        }

        startedDecks.push((args as { id: string }).id);

        return run;
      },
      {
        shouldMockEvents: true,
      },
    );
  });

  afterEach(() => {
    clearMocks();
  });

  const mountScreen = (canGoBack = false) => {
    const deck = deckFactory.build();

    run = {
      id: deck.id,
      status: deckStatus.running,
      url: 'http://localhost:3030/',
    };

    return {
      deck,
      wrapper: mount(DeckScreen, {
        props: {
          deck,
          canGoBack,
        },
        attachTo: document.body,
      }),
    };
  };

  suite('while Slidev starts', () => {
    it('shows a skeleton naming the deck', () => {
      const { deck, wrapper } = mountScreen();

      expect(wrapper.get('[role="status"]').attributes('aria-label')).toBe(
        `Starting ${deck.name}`,
      );
    });
  });

  suite('when the deck is running', () => {
    it('shows the Slidevision overview, keeping the skeleton until it loads', async () => {
      const { deck, wrapper } = mountScreen();

      await flushPromises();

      const overview = wrapper.get('iframe');

      expect(startedDecks).toEqual([deck.id]);
      expect(overview.attributes('src')).toBe(
        'http://localhost:3030/__slidevision-overview?print&embedded=true',
      );
      expect(overview.classes()).toContain('invisible');
      expect(wrapper.find('[role="status"]').exists()).toBe(true);

      await overview.trigger('load');

      expect(overview.classes()).not.toContain('invisible');
      expect(wrapper.find('[role="status"]').exists()).toBe(false);
    });

    it('selects the slide the overview reports', async () => {
      const { wrapper } = mountScreen();

      await flushPromises();

      expect(wrapper.get('iframe').attributes('data-selected-slide')).toBe('1');

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'http://localhost:3030',
          data: {
            source: 'slidevision',
            type: 'select',
            no: 3,
          },
        }),
      );
      await flushPromises();

      expect(wrapper.get('iframe').attributes('data-selected-slide')).toBe('3');
    });
  });

  suite('when the deck fails to start', () => {
    it('shows Slidev output, and Retry starts it again', async () => {
      const { deck, wrapper } = mountScreen();

      run = {
        id: deck.id,
        status: deckStatus.failed,
        error: 'Theme "missing" was not found',
      };
      await flushPromises();

      expect(wrapper.get('[role="alert"] pre').text()).toBe(
        'Theme "missing" was not found',
      );

      run = {
        id: deck.id,
        status: deckStatus.running,
        url: 'http://localhost:3030/',
      };
      await wrapper.get('[role="alert"] button').trigger('click');
      await flushPromises();

      expect(startedDecks).toEqual([deck.id, deck.id]);
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(wrapper.find('iframe').exists()).toBe(true);
    });
  });

  suite('when the deck belongs to a workspace project', () => {
    it('shows a back button that emits back', async () => {
      const { wrapper } = mountScreen(true);

      await wrapper.get('button').trigger('click');

      expect(wrapper.emitted('back')).toHaveLength(1);
    });
  });

  suite('when the deck is the whole project', () => {
    it('shows no back button', () => {
      const { wrapper } = mountScreen(false);

      expect(wrapper.text()).not.toContain('All decks');
    });
  });

  it('shows the deck name and a Play button that is not available yet', () => {
    const { deck, wrapper } = mountScreen();
    const play = wrapper.findAll('button').find((button) => {
      return button.text().includes('Play');
    });

    expect(wrapper.get('h2').text()).toBe(deck.name);
    expect(play?.attributes('disabled')).toBeDefined();
  });
});
