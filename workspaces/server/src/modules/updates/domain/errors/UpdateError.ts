export const updateErrorCode = {
  invalidVersion: 'invalid_version',
  notFound: 'not_found',
} as const;

export type TUpdateErrorCode =
  (typeof updateErrorCode)[keyof typeof updateErrorCode];

export class UpdateError extends Error {
  public readonly code: TUpdateErrorCode;

  private constructor(code: TUpdateErrorCode, message: string) {
    super(message);
    this.name = 'UpdateError';
    this.code = code;
  }

  public static invalidVersion(text: string): UpdateError {
    return new UpdateError(
      updateErrorCode.invalidVersion,
      `Not a version: ${text}`,
    );
  }

  public static notFound(what: string): UpdateError {
    return new UpdateError(updateErrorCode.notFound, `Not found: ${what}`);
  }
}
