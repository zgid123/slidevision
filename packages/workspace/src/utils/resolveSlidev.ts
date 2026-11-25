import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

interface IResolveSlidevParams {
  root: string;
}

export interface ISlidevInstallation {
  bin: string;
  resolve: (specifier: string) => string;
}

export function resolveSlidev({
  root,
}: IResolveSlidevParams): ISlidevInstallation {
  const fromRoot = createRequire(join(root, 'package.json'));
  let packagePath: string;

  try {
    packagePath = fromRoot.resolve('@slidev/cli/package.json');
  } catch {
    throw new Error(
      `Slidev is not installed in ${root}. Install @slidev/cli at the repository root.`,
    );
  }

  const { bin } = JSON.parse(readFileSync(packagePath, 'utf8')) as {
    bin: {
      slidev: string;
    };
  };
  const fromCli = createRequire(packagePath);

  return {
    bin: join(dirname(packagePath), bin.slidev),
    resolve: (specifier) => fromCli.resolve(specifier),
  };
}
