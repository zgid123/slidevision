import { projectKind, type TProject } from '@contracts/project';
import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockConvertFileSrc, mockIPC } from '@tauri-apps/api/mocks';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';

import App from '#/App.vue';
import { openFolderRequestedEvent } from '#/features/projects/api';
import type { IRecentProject } from '#/features/projects/interface';

import { deckFactory } from './factories/DeckFactory';
import { recentProjectFactory } from './factories/RecentProjectFactory';

describe('#App', () => {
  let projects: Map<string, TProject>;
  let recent: IRecentProject[];
  let pickedFolder: string | null;
  let openGate: Promise<void> | null;
  let wrapper: VueWrapper;

  const buttonNamed = (name: string) => {
    const button = wrapper.findAll('button').find((candidate) => {
      return candidate.text().includes(name);
    });

    if (!button) {
      throw new Error(`No button named ${name}`);
    }

    return button;
  };

  const mountApp = async (): Promise<void> => {
    wrapper = mount(App);

    await flushPromises();
  };

  beforeEach(() => {
    projects = new Map();
    recent = [];
    pickedFolder = null;
    openGate = null;
    mockConvertFileSrc('macos');
    mockIPC(
      async (command, args) => {
        const path = (args as { path?: string } | undefined)?.path ?? '';

        switch (command) {
          case 'recent_projects': {
            return recent;
          }
          case 'open_project': {
            await openGate;

            const project = projects.get(path);

            if (!project) {
              throw `${path} has no slidevision.json or slides.md.`;
            }

            return project;
          }
          case 'close_project': {
            return null;
          }
          case 'plugin:dialog|open': {
            return pickedFolder;
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
    wrapper.unmount();
    clearMocks();
  });

  suite('when the app starts', () => {
    it('shows the welcome screen with recent projects', async () => {
      recent = recentProjectFactory.buildList(2);

      await mountApp();

      expect(wrapper.text()).toContain('Open Folder…');
      expect(wrapper.text()).toContain(recent[0]?.name);
      expect(wrapper.text()).toContain(recent[1]?.name);
    });
  });

  suite('when a workspace project is opened from the recent list', () => {
    it('shows its decks, a deck, and back again', async () => {
      const decks = deckFactory.buildList(2);
      const project = recentProjectFactory.build();

      recent = [project];
      projects.set(project.path, {
        kind: projectKind.workspace,
        root: project.path,
        decks,
      });

      await mountApp();
      await buttonNamed(project.name).trigger('click');
      await flushPromises();

      expect(wrapper.findAll('[data-deck-id]')).toHaveLength(2);

      await wrapper.get(`[data-deck-id="${decks[1]?.id}"]`).trigger('click');

      expect(wrapper.get('h2').text()).toBe(decks[1]?.name);

      await buttonNamed('All decks').trigger('click');

      expect(wrapper.findAll('[data-deck-id]')).toHaveLength(2);
    });
  });

  suite('while a project is opening', () => {
    it('shows the folder name over a deck skeleton', async () => {
      let finishOpening = (): void => {};

      openGate = new Promise((resolve) => {
        finishOpening = resolve;
      });
      pickedFolder = '/talks/meetup';
      projects.set('/talks/meetup', {
        kind: projectKind.workspace,
        root: '/talks/meetup',
        decks: deckFactory.buildList(2),
      });

      await mountApp();
      await buttonNamed('Open Folder…').trigger('click');
      await flushPromises();

      expect(wrapper.get('h1').text()).toBe('meetup');
      expect(wrapper.get('[role="status"]').attributes('aria-label')).toBe(
        'Opening /talks/meetup',
      );
      expect(wrapper.text()).not.toContain('Close Project');

      finishOpening();
      await flushPromises();

      expect(wrapper.find('[role="status"]').exists()).toBe(false);
      expect(wrapper.findAll('[data-deck-id]')).toHaveLength(2);
    });
  });

  suite('when File ▸ Open Folder… picks a single-deck folder', () => {
    it('goes straight to the deck', async () => {
      const deck = deckFactory.build();

      pickedFolder = '/talks/solo';
      projects.set('/talks/solo', {
        kind: projectKind.single,
        root: '/talks/solo',
        deck,
      });

      await mountApp();
      await emit(openFolderRequestedEvent);
      await flushPromises();

      expect(wrapper.get('h1').text()).toBe('solo');
      expect(wrapper.get('h2').text()).toBe(deck.name);
      expect(wrapper.text()).not.toContain('All decks');
    });
  });

  suite('when the folder cannot be opened', () => {
    it('stays on the welcome screen with the error', async () => {
      pickedFolder = '/empty';

      await mountApp();
      await buttonNamed('Open Folder…').trigger('click');
      await flushPromises();

      expect(wrapper.get('[role="alert"]').text()).toBe(
        '/empty has no slidevision.json or slides.md.',
      );
    });
  });

  suite('when Close Project is clicked', () => {
    it('returns to the welcome screen', async () => {
      pickedFolder = '/talks/solo';
      projects.set('/talks/solo', {
        kind: projectKind.single,
        root: '/talks/solo',
        deck: deckFactory.build(),
      });

      await mountApp();
      await buttonNamed('Open Folder…').trigger('click');
      await flushPromises();
      await buttonNamed('Close Project').trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Open Folder…');
    });
  });
});
