import { mount } from '@vue/test-utils';

import ThemeSwitch from '#/features/window/components/ThemeSwitch.vue';
import { themePreference } from '#/features/window/interface';

describe('#ThemeSwitch', () => {
  const mountSwitch = () => {
    return mount(ThemeSwitch, {
      props: {
        preference: themePreference.system,
      },
    });
  };

  it('marks the current preference', () => {
    const wrapper = mountSwitch();

    const pressed = wrapper.findAll('button').map((option) => {
      return option.attributes('aria-pressed');
    });

    expect(pressed).toEqual(['true', 'false', 'false']);
  });

  suite('when an option is clicked', () => {
    it('emits choose with that preference', async () => {
      const wrapper = mountSwitch();

      await wrapper.get('[aria-label="Dark"]').trigger('click');

      expect(wrapper.emitted('choose')).toEqual([[themePreference.dark]]);
    });
  });
});
