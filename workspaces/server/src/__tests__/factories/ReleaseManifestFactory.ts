import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { IReleaseManifestValueObjectParams } from '#/modules/updates/domain/valueObjects';

type TFiles = IReleaseManifestValueObjectParams['files'];

interface IReleaseManifestTransientParams {
  intel: boolean;
}

function file(version: string, arch: string) {
  return {
    key: `darwin/${version}/Slidevision-darwin-${arch}.app.tar.gz`,
    signature: faker.string.alphanumeric(96),
  };
}

class ReleaseManifestFactory extends Factory<
  IReleaseManifestValueObjectParams,
  IReleaseManifestTransientParams
> {
  withIntel(): this {
    return this.transient({
      intel: true,
    });
  }

  withoutFiles(): this {
    return this.params({
      files: {},
    });
  }
}

export const releaseManifestFactory = ReleaseManifestFactory.define(
  ({ params, transientParams }) => {
    const {
      version = '0.2.0',
      notes = faker.lorem.sentence(),
      pubDate = faker.date.recent().toISOString(),
      files,
    } = params;
    const defaultFiles: TFiles = transientParams.intel
      ? {
          aarch64: file(version, 'aarch64'),
          // biome-ignore lint/style/useNamingConvention: Tauri architecture name.
          x86_64: file(version, 'x86_64'),
        }
      : {
          aarch64: file(version, 'aarch64'),
        };

    return {
      version,
      notes,
      pubDate,
      files: (files as TFiles | undefined) ?? defaultFiles,
    };
  },
);
