#!/usr/bin/env node
import { ConfigError } from './config/ConfigError';
import { startWorkspace } from './startWorkspace';

try {
  const { decks, server } = await startWorkspace({
    root: process.cwd(),
  });
  const url = server.resolvedUrls?.local[0] ?? '';

  console.log(
    `\n  Slidevision  ${decks.length} deck${decks.length === 1 ? '' : 's'}\n\n  landing page  > ${url}\n`,
  );
} catch (error) {
  if (!(error instanceof ConfigError)) {
    throw error;
  }

  console.error(`slidevision: ${error.message}`);
  process.exitCode = 1;
}
