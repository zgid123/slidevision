import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleExtension = extname(fileURLToPath(import.meta.url));

export const clientDir = fileURLToPath(new URL('../client', import.meta.url));

export const slidevStarter = fileURLToPath(
  new URL(
    `./slidev/start${moduleExtension === '.ts' ? '.ts' : '.mjs'}`,
    import.meta.url,
  ),
);
