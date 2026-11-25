import { mount } from '@vue/test-utils';

import CardGridSkeleton from '#/features/decks/components/CardGridSkeleton.vue';

describe('#CardGridSkeleton', () => {
  it('announces what is loading', () => {
    const wrapper = mount(CardGridSkeleton, {
      props: {
        label: 'Opening /talks/meetup',
      },
    });

    const status = wrapper.get('[role="status"]');

    expect(status.attributes('aria-label')).toBe('Opening /talks/meetup');
    expect(status.attributes('aria-busy')).toBe('true');
  });

  it('shows two rows of placeholder cards', () => {
    const wrapper = mount(CardGridSkeleton, {
      props: {
        label: 'Opening /talks/meetup',
      },
    });

    expect(wrapper.findAll('[data-card-skeleton]')).toHaveLength(6);
  });
});
