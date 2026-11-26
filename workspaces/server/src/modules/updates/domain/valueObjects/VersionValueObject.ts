import { UpdateError } from '../errors';

export interface IVersionValueObjectParams {
  readonly text: string;
}

export class VersionValueObject {
  public readonly major: number;
  public readonly minor: number;
  public readonly patch: number;

  private constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  public static parse({ text }: IVersionValueObjectParams): VersionValueObject {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(text.trim());

    if (!match) {
      throw UpdateError.invalidVersion(text);
    }

    return new VersionValueObject(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    );
  }

  public isNewerThan(other: VersionValueObject): boolean {
    if (this.major !== other.major) {
      return this.major > other.major;
    }

    if (this.minor !== other.minor) {
      return this.minor > other.minor;
    }

    return this.patch > other.patch;
  }

  public toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}
