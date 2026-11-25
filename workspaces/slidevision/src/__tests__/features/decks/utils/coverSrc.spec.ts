import { clearMocks, mockConvertFileSrc } from '@tauri-apps/api/mocks';

import { coverSrc } from '#/features/decks/utils/coverSrc';

describe('#coverSrc', () => {
  afterEach(() => {
    clearMocks();
  });

  suite('when the cover is a URL', () => {
    it('returns the URL unchanged', () => {
      const src = coverSrc({
        kind: 'url',
        url: 'https://example.com/cover.png',
      });

      expect(src).toBe('https://example.com/cover.png');
    });
  });

  suite('when the cover is a file on macOS', () => {
    it('returns an asset protocol URL for the path', () => {
      mockConvertFileSrc('macos');

      const src = coverSrc({
        kind: 'file',
        path: '/talks/decks/alpha/cover image.png',
      });

      expect(src).toBe(
        'asset://localhost/%2Ftalks%2Fdecks%2Falpha%2Fcover%20image.png',
      );
    });
  });

  suite('when the cover is a file on Windows', () => {
    it('returns an asset localhost URL for the path', () => {
      mockConvertFileSrc('windows');

      const src = coverSrc({
        kind: 'file',
        path: 'C:\\talks\\cover.png',
      });

      expect(src).toBe('http://asset.localhost/C%3A%5Ctalks%5Ccover.png');
    });
  });
});
