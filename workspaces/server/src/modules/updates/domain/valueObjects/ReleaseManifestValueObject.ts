import type { TArchitecture } from './PlatformValueObject';
import { VersionValueObject } from './VersionValueObject';

export interface IReleaseFile {
  readonly key: string;
  readonly signature: string;
}

export interface IReleaseManifestValueObjectParams {
  readonly version: string;
  readonly notes: string;
  readonly pubDate: string;
  readonly files: Partial<Record<TArchitecture, IReleaseFile>>;
}

export class ReleaseManifestValueObject {
  public readonly version: VersionValueObject;
  public readonly notes: string;
  public readonly pubDate: string;
  readonly #files: Partial<Record<TArchitecture, IReleaseFile>>;

  private constructor(params: IReleaseManifestValueObjectParams) {
    this.version = VersionValueObject.parse({
      text: params.version,
    });
    this.notes = params.notes;
    this.pubDate = params.pubDate;
    this.#files = params.files;
  }

  public static create(
    params: IReleaseManifestValueObjectParams,
  ): ReleaseManifestValueObject {
    return new ReleaseManifestValueObject(params);
  }

  public fileFor(arch: TArchitecture): IReleaseFile | null {
    return this.#files[arch] ?? null;
  }
}
