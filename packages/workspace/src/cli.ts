#!/usr/bin/env node
import { ConfigError } from './config/ConfigError';
import { startWorkspace } from './startWorkspace';

try {
  const workspace = await startWorkspace({
    root: process.cwd(),
  });
  const { decks, server } = workspace;
  const url = server.resolvedUrls?.local[0] ?? '';
  const shutdown = async (): Promise<void> => {
    console.log('\n  Stopping decks…');
    await workspace.close();
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
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
