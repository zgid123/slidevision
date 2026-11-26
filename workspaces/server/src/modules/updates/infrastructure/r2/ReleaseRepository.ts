import type {
  IFindFileParams,
  IFindManifestParams,
  IReleaseDownload,
  IReleaseRepository,
} from '../../domain/repositories';
import {
  type IReleaseManifestValueObjectParams,
  ReleaseManifestValueObject,
} from '../../domain/valueObjects';

export interface IReleaseRepositoryParams {
  readonly bucket: R2Bucket;
}

export class ReleaseRepository implements IReleaseRepository {
  readonly #bucket: R2Bucket;

  public constructor({ bucket }: IReleaseRepositoryParams) {
    this.#bucket = bucket;
  }

  public async findManifest({
    target,
  }: IFindManifestParams): Promise<ReleaseManifestValueObject | null> {
    const object = await this.#bucket.get(`manifests/${target}.json`);

    if (!object) {
      return null;
    }

    const params = await object.json<IReleaseManifestValueObjectParams>();

    return ReleaseManifestValueObject.create(params);
  }

  public async findFile({
    key,
  }: IFindFileParams): Promise<IReleaseDownload | null> {
    const object = await this.#bucket.get(key);

    if (!object) {
      return null;
    }

    return {
      body: object.body,
      size: object.size,
    };
  }
}
