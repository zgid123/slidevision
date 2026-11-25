import { mount } from '@vue/test-utils';

import DeckListSkeleton from '#/features/decks/components/DeckListSkeleton.vue';

describe('#DeckListSkeleton', () => {
  it('announces what is loading', () => {
    const wrapper = mount(DeckListSkeleton, {
      props: {
        label: 'Opening /talks/meetup',
      },
    });

    const status = wrapper.get('[role="status"]');

    expect(status.attributes('aria-label')).toBe('Opening /talks/meetup');
    expect(status.attributes('aria-busy')).toBe('true');
  });

  it('shows a row of placeholder deck cards', () => {
    const wrapper = mount(DeckListSkeleton, {
      props: {
        label: 'Opening /talks/meetup',
      },
    });

    expect(wrapper.findAll('[data-deck-skeleton]')).toHaveLength(6);
  });
});
