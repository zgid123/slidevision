import type { IDeck } from '@contracts/project';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

class DeckFactory extends Factory<IDeck> {
  withFileCover(): this {
    return this.params({
      cover: {
        kind: 'file',
        path: '/talks/decks/assets/cover.png',
      },
    });
  }

  withUrlCover(): this {
    return this.params({
      cover: {
        kind: 'url',
        url: faker.image.url(),
      },
    });
  }
}

export const deckFactory = DeckFactory.define(({ sequence }) => {
  const dir = `/talks/decks/deck-${sequence}`;

  return {
    id: `decks/deck-${sequence}`,
    name: faker.lorem.words(3),
    dir,
    entry: `${dir}/slides.md`,
  };
});
