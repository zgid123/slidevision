import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SERVER = 'https://slidevision-server.tachyon.cyou';

const PLATFORMS = ['darwin', 'windows'] as const;

const ARCHITECTURES = ['aarch64', 'x86_64'] as const;

export type TPlatform = (typeof PLATFORMS)[number];
export type TArchitecture = (typeof ARCHITECTURES)[number];

export interface IDownload {
  readonly arch: TArchitecture;
  readonly url: string;
}

export interface IRelease {
  readonly version: string;
  readonly downloads: readonly IDownload[];
  readonly date?: string;
}

export type TReleases = Partial<Record<TPlatform, IRelease>>;

interface IManifestFile {
  readonly key: string;
  readonly installer?: string;
}

interface IManifest {
  readonly version: string;
  readonly pubDate?: string;
  readonly files?: Partial<Record<string, IManifestFile>>;
}

export interface IReadReleasesParams {
  readonly dir: string | undefined;
}

export function readReleases({ dir }: IReadReleasesParams): TReleases {
  const releases: TReleases = {};

  if (!dir) {
    return releases;
  }

  for (const platform of PLATFORMS) {
    const release = readRelease(join(dir, `${platform}.json`));

    if (release) {
      releases[platform] = release;
    }
  }

  return releases;
}

function downloadUrl(key: string): string {
  return `${SERVER}/download/${key}`;
}

function readRelease(path: string): IRelease | null {
  const manifest = readManifest(path);

  if (!manifest) {
    return null;
  }

  const downloads: IDownload[] = [];

  for (const arch of ARCHITECTURES) {
    const file = manifest.files?.[arch];

    if (file) {
      downloads.push({
        arch,
        url: downloadUrl(file.installer ?? file.key),
      });
    }
  }

  if (downloads.length === 0) {
    return null;
  }

  const date = manifest.pubDate ? manifest.pubDate.slice(0, 10) : undefined;

  return {
    version: manifest.version,
    downloads,
    date,
  };
}

function readManifest(path: string): IManifest | null {
  if (!existsSync(path)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(path, 'utf8')) as IManifest;
  } catch {
    return null;
  }
}
