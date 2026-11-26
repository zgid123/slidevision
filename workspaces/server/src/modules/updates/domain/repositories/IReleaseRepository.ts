import type { ReleaseManifestValueObject, TTarget } from '../valueObjects';

export interface IFindManifestParams {
  readonly target: TTarget;
}

export interface IFindFileParams {
  readonly key: string;
}

export interface IReleaseDownload {
  readonly body: ReadableStream;
  readonly size: number;
}

export interface IReleaseRepository {
  findManifest(
    params: IFindManifestParams,
  ): Promise<ReleaseManifestValueObject | null>;
  findFile(params: IFindFileParams): Promise<IReleaseDownload | null>;
}
