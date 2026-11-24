import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export interface ITestDeck {
  folder: string;
  title: string | null;
  files: Record<string, string | Uint8Array>;
  background?: string;
}

export const pngBytes = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
);

class DeckFactory extends Factory<ITestDeck> {
  withCover(): this {
    return this.params({
      background: './assets/main.png',
      files: {
        'assets/main.png': pngBytes,
      },
    });
  }

  untitled(): this {
    return this.params({
      title: null,
    });
  }
}

export const deckFactory = DeckFactory.define(({ sequence, params }) => {
  const {
    folder = `decks/deck-${sequence}`,
    title = faker.lorem.words(3),
    files = {},
    ...deck
  } = params;

  return {
    folder,
    title,
    files: files as ITestDeck['files'],
    ...deck,
  };
});
