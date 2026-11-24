interface IConfigErrorParams {
  path: string;
  problem: string;
}

export class ConfigError extends Error {
  public constructor({ path, problem }: IConfigErrorParams) {
    super(`${path}: ${problem}`);
    this.name = 'ConfigError';
  }
}
