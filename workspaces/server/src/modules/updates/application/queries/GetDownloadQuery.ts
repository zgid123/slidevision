import { type IQueryHandler, Query } from '@cqrsx/core';

import { UpdateError } from '../../domain/errors';
import type {
  IReleaseDownload,
  IReleaseRepository,
} from '../../domain/repositories';
import { isTarget } from '../../domain/valueObjects';

export interface IGetDownloadQueryParams {
  readonly key: string;
}

export class GetDownloadQuery extends Query<IReleaseDownload> {
  public readonly key: string;

  public constructor({ key }: IGetDownloadQueryParams) {
    super();

    this.key = key;
  }
}

export interface IGetDownloadQueryHandlerParams {
  readonly releaseRepository: IReleaseRepository;
}

export class GetDownloadQueryHandler
  implements IQueryHandler<GetDownloadQuery, IReleaseDownload>
{
  readonly #releaseRepository: IReleaseRepository;

  public constructor({ releaseRepository }: IGetDownloadQueryHandlerParams) {
    this.#releaseRepository = releaseRepository;
  }

  public async exec({ key }: GetDownloadQuery): Promise<IReleaseDownload> {
    const [folder = ''] = key.split('/');

    if (!isTarget(folder) || key.includes('..')) {
      throw UpdateError.notFound(key);
    }

    const download = await this.#releaseRepository.findFile({
      key,
    });

    if (!download) {
      throw UpdateError.notFound(key);
    }

    return download;
  }
}
