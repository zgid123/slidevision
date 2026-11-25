import { mount } from '@vue/test-utils';

import WelcomeScreen from '#/features/projects/components/WelcomeScreen.vue';

import { recentProjectFactory } from '../../../factories/RecentProjectFactory';

describe('#WelcomeScreen', () => {
  suite('when nothing has been opened yet', () => {
    it('says where recent projects appear', () => {
      const wrapper = mount(WelcomeScreen, {
        props: {
          recent: [],
          error: null,
        },
      });

      expect(wrapper.text()).toContain('Projects you open appear here.');
    });
  });

  suite('when Open Folder is clicked', () => {
    it('emits openFolder', async () => {
      const wrapper = mount(WelcomeScreen, {
        props: {
          recent: [],
          error: null,
        },
      });

      await wrapper.get('button').trigger('click');

      expect(wrapper.emitted('openFolder')).toHaveLength(1);
    });
  });

  suite('when there is an error', () => {
    it('shows it as an alert', () => {
      const wrapper = mount(WelcomeScreen, {
        props: {
          recent: [],
          error: '/empty has no slidevision.json or slides.md.',
        },
      });

      expect(wrapper.get('[role="alert"]').text()).toBe(
        '/empty has no slidevision.json or slides.md.',
      );
    });
  });

  describe('recent projects', () => {
    suite('when a recent project is available', () => {
      it('emits open with its path', async () => {
        const project = recentProjectFactory.build();
        const wrapper = mount(WelcomeScreen, {
          props: {
            recent: [project],
            error: null,
          },
        });

        await wrapper.get(`li button:not([aria-label])`).trigger('click');

        expect(wrapper.emitted('open')).toEqual([[project.path]]);
      });
    });

    suite('when a recent project folder is gone', () => {
      it('marks it unavailable and cannot open it', () => {
        const project = recentProjectFactory.unavailable().build();
        const wrapper = mount(WelcomeScreen, {
          props: {
            recent: [project],
            error: null,
          },
        });

        const openButton = wrapper.get('li button:not([aria-label])');

        expect(openButton.attributes('disabled')).toBeDefined();
        expect(openButton.text()).toContain('Folder not found');
      });
    });

    suite('when Remove is clicked', () => {
      it('emits remove with its path', async () => {
        const project = recentProjectFactory.unavailable().build();
        const wrapper = mount(WelcomeScreen, {
          props: {
            recent: [project],
            error: null,
          },
        });

        await wrapper
          .get(`[aria-label="Remove ${project.name} from recent projects"]`)
          .trigger('click');

        expect(wrapper.emitted('remove')).toEqual([[project.path]]);
      });
    });
  });
});
