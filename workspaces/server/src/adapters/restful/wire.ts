import type { Cqrsx } from '@cqrsx/core';

import { wireUpdates } from '#/modules/updates/adapters/restful/wire';
import type { IReleaseRepository } from '#/modules/updates/domain/repositories';

export interface IWireContainer {
  readonly cqrsx: Cqrsx;
}

interface IWireParams {
  readonly cqrsx: Cqrsx;
  readonly releaseRepository: IReleaseRepository;
}

export function wire({
  cqrsx,
  releaseRepository,
}: IWireParams): IWireContainer {
  wireUpdates({
    cqrsx,
    releaseRepository,
  });

  return {
    cqrsx,
  };
}
