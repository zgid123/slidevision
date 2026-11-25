const overviewPath = '__slidevision-overview?print&embedded=true';

interface IOverviewSrcParams {
  url: string;
}

interface IReadSelectedSlideParams {
  url: string;
  event: MessageEvent;
}

export function overviewSrc({ url }: IOverviewSrcParams): string {
  return new URL(overviewPath, url).href;
}

export function readSelectedSlide({
  url,
  event,
}: IReadSelectedSlideParams): number | null {
  const { data } = event;

  if (
    event.origin !== new URL(url).origin ||
    typeof data !== 'object' ||
    data === null ||
    data.source !== 'slidevision' ||
    data.type !== 'select' ||
    !Number.isInteger(data.no) ||
    data.no < 1
  ) {
    return null;
  }

  return data.no;
}
