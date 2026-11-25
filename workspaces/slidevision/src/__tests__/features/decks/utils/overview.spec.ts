import {
  overviewSrc,
  readSelectedSlide,
} from '#/features/decks/utils/overview';

const url = 'http://localhost:3031/';

const message = (data: unknown, origin = 'http://localhost:3031') => {
  return new MessageEvent('message', {
    data,
    origin,
  });
};

describe('#overviewSrc', () => {
  it('points at the Slidevision overview in Slidev print mode, embedded', () => {
    expect(
      overviewSrc({
        url,
      }),
    ).toBe('http://localhost:3031/__slidevision-overview?print&embedded=true');
  });
});

describe('#readSelectedSlide', () => {
  suite('when the overview reports a selection', () => {
    it('returns the slide number', () => {
      expect(
        readSelectedSlide({
          url,
          event: message({
            source: 'slidevision',
            type: 'select',
            no: 4,
          }),
        }),
      ).toBe(4);
    });
  });

  suite('when the message comes from another origin', () => {
    it('ignores it', () => {
      expect(
        readSelectedSlide({
          url,
          event: message(
            {
              source: 'slidevision',
              type: 'select',
              no: 4,
            },
            'http://localhost:3032',
          ),
        }),
      ).toBeNull();
    });
  });

  suite('when the message is something else', () => {
    it('ignores it', () => {
      expect(
        readSelectedSlide({
          url,
          event: message({
            source: 'slidev',
            type: 'select',
            no: 4,
          }),
        }),
      ).toBeNull();
      expect(
        readSelectedSlide({
          url,
          event: message({
            source: 'slidevision',
            type: 'select',
            no: 0,
          }),
        }),
      ).toBeNull();
      expect(
        readSelectedSlide({
          url,
          event: message('select 4'),
        }),
      ).toBeNull();
    });
  });
});
