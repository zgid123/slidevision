import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readReleases } from '../releases';

const SERVER = 'https://slidevision-server.tachyon.cyou/download';

function folderWith(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'slidevision-releases-'));

  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(dir, name), contents);
  }

  return dir;
}

const DARWIN = JSON.stringify({
  version: '0.2.0',
  notes: '',
  pubDate: '2026-11-26T12:00:00.000Z',
  files: {
    // biome-ignore lint/style/useNamingConvention: Tauri architecture name.
    x86_64: {
      key: 'darwin/0.2.0/Slidevision-darwin-x86_64.app.tar.gz',
      signature: 'ab',
      installer: 'darwin/0.2.0/Slidevision-0.2.0-darwin-x86_64.dmg',
    },
    aarch64: {
      key: 'darwin/0.2.0/Slidevision-darwin-aarch64.app.tar.gz',
      signature: 'ab',
      installer: 'darwin/0.2.0/Slidevision-0.2.0-darwin-aarch64.dmg',
    },
  },
});

const WINDOWS = JSON.stringify({
  version: '0.2.0',
  notes: '',
  pubDate: '2026-11-26T12:00:00.000Z',
  files: {
    // biome-ignore lint/style/useNamingConvention: Tauri architecture name.
    x86_64: {
      key: 'windows/0.2.0/Slidevision-windows-x86_64-setup.exe',
      signature: 'ab',
    },
  },
});

describe('#readReleases', () => {
  let dir: string | undefined;

  afterEach(() => {
    if (dir) {
      rmSync(dir, {
        recursive: true,
      });
      dir = undefined;
    }
  });

  suite('when both manifests are present', () => {
    it('links each dmg, Apple silicon first, and the Windows installer', () => {
      dir = folderWith({
        'darwin.json': DARWIN,
        'windows.json': WINDOWS,
      });

      expect(
        readReleases({
          dir,
        }),
      ).toEqual({
        darwin: {
          version: '0.2.0',
          date: '2026-11-26',
          downloads: [
            {
              arch: 'aarch64',
              url: `${SERVER}/darwin/0.2.0/Slidevision-0.2.0-darwin-aarch64.dmg`,
            },
            {
              arch: 'x86_64',
              url: `${SERVER}/darwin/0.2.0/Slidevision-0.2.0-darwin-x86_64.dmg`,
            },
          ],
        },
        windows: {
          version: '0.2.0',
          date: '2026-11-26',
          downloads: [
            {
              arch: 'x86_64',
              url: `${SERVER}/windows/0.2.0/Slidevision-windows-x86_64-setup.exe`,
            },
          ],
        },
      });
    });
  });

  suite('when a manifest is missing, empty, or invalid', () => {
    it('omits that platform', () => {
      dir = folderWith({
        'darwin.json': '',
        'windows.json': '{not json',
      });

      expect(
        readReleases({
          dir,
        }),
      ).toEqual({});
    });
  });

  suite('when a manifest has no files', () => {
    it('omits that platform', () => {
      dir = folderWith({
        'darwin.json': JSON.stringify({
          version: '0.2.0',
          files: {},
        }),
      });

      expect(
        readReleases({
          dir,
        }),
      ).toEqual({});
    });
  });

  suite('when built without manifests', () => {
    it('returns no releases', () => {
      expect(
        readReleases({
          dir: undefined,
        }),
      ).toEqual({});
    });
  });
});
