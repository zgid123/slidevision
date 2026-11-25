import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { IRecentProject } from '#/features/projects/interface';

class RecentProjectFactory extends Factory<IRecentProject> {
  unavailable(): this {
    return this.params({
      isAvailable: false,
    });
  }
}

export const recentProjectFactory = RecentProjectFactory.define(
  ({ sequence }) => {
    const name = `${faker.word.noun()}-${sequence}`;

    return {
      path: `/Users/presenter/talks/${name}`,
      name,
      openedAt: faker.date.recent().getTime(),
      isAvailable: true,
    };
  },
);
