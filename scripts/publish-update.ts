import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export interface IReleaseNotesParams {
  changelog: string;
  version: string;
}

export interface IMinisignKeyIdParams {
  encoded: string;
}

export interface IBuiltInPublicKeyParams {
  configText: string;
}

export interface IReleaseBuild {
  arch: string;
  key: string;
  signature: string;
  installer?: string;
}

export interface IParseArchPathParams {
  value: string;
}

export interface IArchPath {
  arch: string;
  path: string;
}

export interface IBuildManifestParams {
  version: string;
  notes: string;
  pubDate: string;
  builds: IReleaseBuild[];
}

export interface IManifestFile {
  key: string;
  signature: string;
  installer?: string;
}

export interface IUpdateManifest {
  version: string;
  notes: string;
  pubDate: string;
  files: Record<string, IManifestFile>;
}

function stripChangesetLinks(entry: string): string {
  return entry
    .replace(/^\[#\d+\]\([^)]*\)\s*/, '')
    .replace(/^\[`[0-9a-f]+`\]\([^)]*\)\s*/, '')
    .replace(/^Thanks \[@[^\]]+\]\([^)]*\)!\s*-\s*/, '')
    .trim();
}

export function releaseNotes({
  changelog,
  version,
}: IReleaseNotesParams): string {
  const lines = changelog.split('\n');
  const start = lines.findIndex((line) => {
    return line.trim() === `## ${version}`;
  });

  if (start === -1) {
    return '';
  }

  const section: string[] = [];

  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) {
      break;
    }

    if (line.startsWith('- ')) {
      section.push(`- ${stripChangesetLinks(line.slice(2))}`);
    }
  }

  return section.join('\n');
}

export function minisignKeyId({ encoded }: IMinisignKeyIdParams): string {
  const decoded = Buffer.from(encoded.trim(), 'base64').toString('utf8');
  const lines = decoded.trim().split('\n');
  const payload = lines[1]?.trim();

  if (!payload) {
    throw new Error('Invalid minisign payload: missing key or signature line');
  }

  const bytes = Buffer.from(payload, 'base64');

  if (bytes.length < 10) {
    throw new Error('Invalid minisign payload: too short to contain key ID');
  }

  return bytes.subarray(2, 10).toString('hex').toUpperCase();
}

export function builtInPublicKey({
  configText,
}: IBuiltInPublicKeyParams): string {
  const config = JSON.parse(configText) as {
    plugins?: {
      updater?: {
        pubkey?: string;
      };
    };
  };
  const pubkey = config.plugins?.updater?.pubkey?.trim();

  if (!pubkey) {
    throw new Error('No plugins.updater.pubkey in tauri.conf.json');
  }

  return pubkey;
}

export function buildManifest({
  version,
  notes,
  pubDate,
  builds,
}: IBuildManifestParams): IUpdateManifest {
  const files: Record<string, IManifestFile> = {};

  for (const { arch, key, signature, installer } of builds) {
    files[arch] = installer
      ? {
          key,
          signature,
          installer,
        }
      : {
          key,
          signature,
        };
  }

  return {
    version,
    notes,
    pubDate,
    files,
  };
}

export function parseArchPath({ value }: IParseArchPathParams): IArchPath {
  const separator = value.indexOf('=');

  if (separator <= 0 || separator === value.length - 1) {
    throw new Error(`Expected <arch>=<path>, got ${value}`);
  }

  return {
    arch: value.slice(0, separator),
    path: value.slice(separator + 1),
  };
}

function main(): void {
  const { values } = parseArgs({
    options: {
      platform: {
        type: 'string',
      },
      version: {
        type: 'string',
      },
      file: {
        type: 'string',
        multiple: true,
      },
      installer: {
        type: 'string',
        multiple: true,
      },
      out: {
        type: 'string',
      },
    },
  });
  const { platform, version, file = [], installer = [], out } = values;

  if (!platform || !version || file.length === 0 || !out) {
    throw new Error(
      'Usage: --platform --version --file <arch>=<path>... [--installer <arch>=<path>...] --out',
    );
  }

  const configText = readFileSync(
    join(ROOT, 'workspaces/slidevision/src-tauri/tauri.conf.json'),
    'utf8',
  );
  const expectedKeyId = minisignKeyId({
    encoded: builtInPublicKey({
      configText,
    }),
  });
  const folder = `${platform}/${version}/`;
  const installers = new Map(
    installer.map((value) => {
      const { arch, path } = parseArchPath({
        value,
      });

      return [arch, path];
    }),
  );
  const uploads: string[] = [];
  const builds = file.map((value): IReleaseBuild => {
    const { arch, path } = parseArchPath({
      value,
    });
    const signaturePath = `${path}.sig`;

    if (!existsSync(signaturePath)) {
      throw new Error(`Missing updater signature file: ${signaturePath}`);
    }

    const signature = readFileSync(signaturePath, 'utf8').trim();

    if (!signature) {
      throw new Error(`Empty updater signature file: ${signaturePath}`);
    }

    if (
      minisignKeyId({
        encoded: signature,
      }) !== expectedKeyId
    ) {
      throw new Error(
        `Signature ${signaturePath} does not match plugins.updater.pubkey in tauri.conf.json`,
      );
    }

    const key = `${folder}${basename(path)}`;
    const installerPath = installers.get(arch);
    const installerKey = installerPath
      ? `${folder}${basename(installerPath)}`
      : undefined;

    uploads.push(`${key}\t${path}`);

    if (installerPath && installerKey) {
      uploads.push(`${installerKey}\t${installerPath}`);
    }

    return {
      arch,
      key,
      signature,
      installer: installerKey,
    };
  });
  const changelogPath = join(ROOT, 'workspaces/slidevision/CHANGELOG.md');

  if (!existsSync(changelogPath)) {
    console.warn(`No ${changelogPath}: the update has no release notes`);
  }

  const manifest = buildManifest({
    version,
    notes: existsSync(changelogPath)
      ? releaseNotes({
          changelog: readFileSync(changelogPath, 'utf8'),
          version,
        })
      : '',
    pubDate: new Date().toISOString(),
    builds,
  });

  mkdirSync(out, {
    recursive: true,
  });
  writeFileSync(
    join(out, `${platform}.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(join(out, 'uploads'), `${uploads.join('\n')}\n`);

  for (const { key } of builds) {
    console.log(`Prepared ${key}`);
  }
}

const entry = process.argv[1];

if (entry && import.meta.url === pathToFileURL(entry).href) {
  main();
}
