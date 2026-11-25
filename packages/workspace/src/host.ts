import { runHost } from './host/runHost';

await runHost({
  input: process.stdin,
  output: process.stdout,
});
