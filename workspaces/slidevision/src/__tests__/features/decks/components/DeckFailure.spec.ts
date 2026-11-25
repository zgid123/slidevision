import { mount } from '@vue/test-utils';

import DeckFailure from '#/features/decks/components/DeckFailure.vue';

describe('#DeckFailure', () => {
  const mountFailure = () => {
    return mount(DeckFailure, {
      props: {
        deckName: 'Beta',
        error: 'Theme "missing" was not found',
      },
    });
  };

  it('names the deck and shows Slidev output', () => {
    const alert = mountFailure().get('[role="alert"]');

    expect(alert.text()).toContain('Beta could not start');
    expect(alert.get('pre').text()).toBe('Theme "missing" was not found');
  });

  it('emits retry', async () => {
    const wrapper = mountFailure();

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
