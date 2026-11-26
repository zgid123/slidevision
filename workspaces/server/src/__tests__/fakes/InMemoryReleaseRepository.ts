import type {
  IFindFileParams,
  IFindManifestParams,
  IReleaseDownload,
  IReleaseRepository,
} from '#/modules/updates/domain/repositories';
import {
  type IReleaseManifestValueObjectParams,
  ReleaseManifestValueObject,
  type TTarget,
} from '#/modules/updates/domain/valueObjects';

export interface IPutManifestParams {
  readonly target: TTarget;
  readonly manifest: IReleaseManifestValueObjectParams;
}

export interface IPutFileParams {
  readonly key: string;
  readonly bytes: Uint8Array;
}

export class InMemoryReleaseRepository implements IReleaseRepository {
  readonly #manifests = new Map<TTarget, IReleaseManifestValueObjectParams>();
  readonly #files = new Map<string, ArrayBuffer>();

  public putManifest({ target, manifest }: IPutManifestParams): void {
    this.#manifests.set(target, manifest);
  }

  public putFile({ key, bytes }: IPutFileParams): void {
    this.#files.set(key, new Uint8Array(bytes).buffer);
  }

  public async findManifest({
    target,
  }: IFindManifestParams): Promise<ReleaseManifestValueObject | null> {
    const manifest = this.#manifests.get(target);

    return manifest ? ReleaseManifestValueObject.create(manifest) : null;
  }

  public async findFile({
    key,
  }: IFindFileParams): Promise<IReleaseDownload | null> {
    const bytes = this.#files.get(key);

    if (!bytes) {
      return null;
    }

    return {
      body: new Response(bytes).body as ReadableStream,
      size: bytes.byteLength,
    };
  }
}
