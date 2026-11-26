interface IFormatOpenedAtParams {
  openedAt: number;
  now: number;
}

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

const relative = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});
const calendar = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
});

const capitalize = (text: string): string => {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

export function formatOpenedAt({
  openedAt,
  now,
}: IFormatOpenedAtParams): string {
  const elapsed = Math.max(0, now - openedAt);

  if (elapsed < minute) {
    return 'Just now';
  }

  if (elapsed < hour) {
    return relative.format(-Math.floor(elapsed / minute), 'minute');
  }

  if (elapsed < day) {
    return relative.format(-Math.floor(elapsed / hour), 'hour');
  }

  if (elapsed < week) {
    return capitalize(relative.format(-Math.floor(elapsed / day), 'day'));
  }

  return calendar.format(openedAt);
}
