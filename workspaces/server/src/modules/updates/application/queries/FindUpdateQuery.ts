import { type IQueryHandler, Query } from '@cqrsx/core';

import type { IReleaseRepository } from '../../domain/repositories';
import {
  PlatformValueObject,
  VersionValueObject,
} from '../../domain/valueObjects';

export interface IAvailableUpdate {
  readonly version: string;
  readonly notes: string;
  readonly pubDate: string;
  readonly key: string;
  readonly signature: string;
}

export interface IFindUpdateQueryParams {
  readonly target: string;
  readonly arch: string;
  readonly version: string;
}

export class FindUpdateQuery extends Query<IAvailableUpdate | null> {
  public readonly target: string;
  public readonly arch: string;
  public readonly version: string;

  public constructor({ target, arch, version }: IFindUpdateQueryParams) {
    super();

    this.target = target;
    this.arch = arch;
    this.version = version;
  }
}

export interface IFindUpdateQueryHandlerParams {
  readonly releaseRepository: IReleaseRepository;
}

export class FindUpdateQueryHandler
  implements IQueryHandler<FindUpdateQuery, IAvailableUpdate | null>
{
  readonly #releaseRepository: IReleaseRepository;

  public constructor({ releaseRepository }: IFindUpdateQueryHandlerParams) {
    this.#releaseRepository = releaseRepository;
  }

  public async exec({
    target,
    arch,
    version,
  }: FindUpdateQuery): Promise<IAvailableUpdate | null> {
    const platform = PlatformValueObject.parse({
      target,
      arch,
    });
    const current = VersionValueObject.parse({
      text: version,
    });
    const manifest = await this.#releaseRepository.findManifest({
      target: platform.target,
    });

    if (!manifest?.version.isNewerThan(current)) {
      return null;
    }

    const file = manifest.fileFor(platform.arch);

    if (!file) {
      return null;
    }

    return {
      version: manifest.version.toString(),
      notes: manifest.notes,
      pubDate: manifest.pubDate,
      key: file.key,
      signature: file.signature,
    };
  }
}
