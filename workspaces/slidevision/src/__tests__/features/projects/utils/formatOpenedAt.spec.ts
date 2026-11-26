import { formatOpenedAt } from '#/features/projects/utils/formatOpenedAt';

describe('#formatOpenedAt', () => {
  const now = new Date(2026, 10, 26, 12).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const openedAgo = (elapsed: number): string => {
    return formatOpenedAt({
      openedAt: now - elapsed,
      now,
    });
  };

  suite('when opened less than a minute ago', () => {
    it('says just now', () => {
      expect(openedAgo(30_000)).toBe('Just now');
    });
  });

  suite('when opened within the hour', () => {
    it('counts minutes', () => {
      expect(openedAgo(5 * minute)).toBe('5 minutes ago');
    });
  });

  suite('when opened within the day', () => {
    it('counts hours', () => {
      expect(openedAgo(2 * hour)).toBe('2 hours ago');
    });
  });

  suite('when opened within the week', () => {
    it('says yesterday for one day', () => {
      expect(openedAgo(day)).toBe('Yesterday');
    });

    it('counts days', () => {
      expect(openedAgo(3 * day)).toBe('3 days ago');
    });
  });

  suite('when opened a week or more ago', () => {
    it('shows the date', () => {
      expect(openedAgo(10 * day)).toBe('Nov 16');
    });
  });

  suite('when the clock is behind the opened time', () => {
    it('says just now', () => {
      expect(openedAgo(-hour)).toBe('Just now');
    });
  });
});
