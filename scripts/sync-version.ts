import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

type TUpdateVersion = (text: string, version: string) => string;

interface IVersionedFile {
  path: string;
  update: TUpdateVersion;
}

interface IAppPackage {
  name: string;
  version: string;
}

export interface IReplaceOnceParams {
  text: string;
  pattern: RegExp;
  replacement: string;
}

export interface ISyncVersionsParams {
  root: string;
}

export const PACKAGE_PATH = 'workspaces/slidevision/package.json';

export const FILES: readonly IVersionedFile[] = [
  {
    path: 'workspaces/slidevision/src-tauri/Cargo.toml',
    update: (text, version) => {
      return replaceOnce({
        text,
        pattern: /^version = "[^"]*"/m,
        replacement: `version = "${version}"`,
      });
    },
  },
];

export function replaceOnce({
  text,
  pattern,
  replacement,
}: IReplaceOnceParams): string {
  if (!pattern.test(text)) {
    throw new Error(`No version found for ${pattern}`);
  }

  return text.replace(pattern, replacement);
}

export function syncVersions({ root }: ISyncVersionsParams): string {
  const { name, version }: IAppPackage = JSON.parse(
    readFileSync(join(root, PACKAGE_PATH), 'utf8'),
  );

  for (const { path, update } of FILES) {
    const file = join(root, path);

    writeFileSync(file, update(readFileSync(file, 'utf8'), version));
  }

  return `${name} ${version}`;
}

const entry = process.argv[1];

if (entry && import.meta.url === pathToFileURL(entry).href) {
  console.log(
    `Synced ${syncVersions({
      root: ROOT,
    })}`,
  );
}
