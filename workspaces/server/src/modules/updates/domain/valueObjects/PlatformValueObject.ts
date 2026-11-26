import { UpdateError } from '../errors';

export const targetArchitectures = {
  darwin: ['aarch64', 'x86_64'],
  windows: ['x86_64'],
} as const;

export type TTarget = keyof typeof targetArchitectures;
export type TArchitecture = (typeof targetArchitectures)[TTarget][number];

export interface IPlatformValueObjectParams {
  readonly target: string;
  readonly arch: string;
}

export class PlatformValueObject {
  public readonly target: TTarget;
  public readonly arch: TArchitecture;

  private constructor(target: TTarget, arch: TArchitecture) {
    this.target = target;
    this.arch = arch;
  }

  public static parse({
    target,
    arch,
  }: IPlatformValueObjectParams): PlatformValueObject {
    if (!isTarget(target)) {
      throw UpdateError.notFound(`target ${target}`);
    }

    const architectures: readonly string[] = targetArchitectures[target];

    if (!architectures.includes(arch)) {
      throw UpdateError.notFound(`architecture ${arch} for ${target}`);
    }

    return new PlatformValueObject(target, arch as TArchitecture);
  }
}

export function isTarget(target: string): target is TTarget {
  return Object.hasOwn(targetArchitectures, target);
}
