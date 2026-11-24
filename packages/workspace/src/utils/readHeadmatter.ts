import { parse } from 'yaml';

import { isRecord } from './isRecord';

const headmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

interface IReadHeadmatterParams {
  source: string;
}

export function readHeadmatter({
  source,
}: IReadHeadmatterParams): Record<string, unknown> {
  const yaml = headmatterPattern.exec(source)?.[1];

  if (!yaml) {
    return {};
  }

  try {
    const data: unknown = parse(yaml);

    return isRecord(data) ? data : {};
  } catch {
    return {};
  }
}
