import type { Cqrsx } from '@cqrsx/core';

import {
  FindUpdateQuery,
  FindUpdateQueryHandler,
  GetDownloadQuery,
  GetDownloadQueryHandler,
} from '../../application/queries';
import type { IReleaseRepository } from '../../domain/repositories';

export interface IWireUpdatesParams {
  readonly cqrsx: Cqrsx;
  readonly releaseRepository: IReleaseRepository;
}

export function wireUpdates({
  cqrsx,
  releaseRepository,
}: IWireUpdatesParams): void {
  cqrsx
    .register(
      FindUpdateQuery,
      new FindUpdateQueryHandler({
        releaseRepository,
      }),
    )
    .register(
      GetDownloadQuery,
      new GetDownloadQueryHandler({
        releaseRepository,
      }),
    );
}
