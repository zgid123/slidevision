import { fileURLToPath } from 'node:url';

export const clientDir = fileURLToPath(new URL('../client', import.meta.url));
