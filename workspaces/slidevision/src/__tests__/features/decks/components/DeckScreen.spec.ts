import { deckStatus, type IDeckRun } from '@contracts/project';
import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { flushPromises, mount } from '@vue/test-utils';

import DeckScreen from '#/features/decks/components/DeckScreen.vue';

import { deckFactory } from '../../../factories/DeckFactory';

describe('#DeckScreen', () => {
  let run: IDeckRun;
  let startedDecks: string[];
  let plays: unknown[];
  let playFailure: string | null;

  beforeEach(() => {
    startedDecks = [];
    plays = [];
    playFailure = null;
    mockIPC(
      (command, args) => {
        switch (command) {
          case 'start_deck': {
            startedDecks.push((args as { id: string }).id);

            return run;
          }
          case 'play': {
            if (playFailure) {
              throw playFailure;
            }

            plays.push(args);

            return null;
          }
          default: {
            throw new Error(`Unexpected command ${command}`);
          }
        }
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

    it('pauses the overview while a presentation runs', async () => {
      const { wrapper } = mountScreen();

      await flushPromises();
      await emit('presentation-changed', true);
      await flushPromises();

      expect(wrapper.find('iframe').exists()).toBe(false);
      expect(wrapper.get('[data-presenting]').text()).toContain(
        'Presenting from slide 1',
      );

      await emit('presentation-changed', false);
      await flushPromises();

      expect(wrapper.find('iframe').exists()).toBe(true);
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

  it('shows the deck name', () => {
    const { deck, wrapper } = mountScreen();

    expect(wrapper.get('h2').text()).toBe(deck.name);
  });

  describe('Play', () => {
    const playButton = (wrapper: ReturnType<typeof mountScreen>['wrapper']) => {
      const button = wrapper.findAll('button').find((candidate) => {
        return candidate.text().includes('Play');
      });

      if (!button) {
        throw new Error('No Play button');
      }

      return button;
    };

    suite('while Slidev starts', () => {
      it('is not available', () => {
        const { wrapper } = mountScreen();

        expect(playButton(wrapper).attributes('disabled')).toBeDefined();
      });
    });

    suite('when the slides are shown', () => {
      it('presents the deck from the selected slide', async () => {
        const { wrapper } = mountScreen();

        await flushPromises();
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
        await playButton(wrapper).trigger('click');
        await flushPromises();

        expect(plays).toEqual([
          {
            url: 'http://localhost:3030/',
            slide: 3,
          },
        ]);
      });

      it('names the slide it starts from', async () => {
        const { wrapper } = mountScreen();

        await flushPromises();

        expect(playButton(wrapper).text()).toBe('Play');

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

        expect(playButton(wrapper).text()).toBe('Play from 3');
      });
    });

    suite('when the presentation cannot open', () => {
      it('shows why', async () => {
        const { wrapper } = mountScreen();

        playFailure = 'No display was found to present on.';
        await flushPromises();
        await playButton(wrapper).trigger('click');
        await flushPromises();

        expect(wrapper.get('[role="alert"]').text()).toBe(
          'No display was found to present on.',
        );
      });
    });
  });
});
