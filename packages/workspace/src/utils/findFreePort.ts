import { createServer } from 'node:net';

const loopbackHosts = ['127.0.0.1', '::1'];
const unavailableAddressCodes = new Set(['EADDRNOTAVAIL', 'EAFNOSUPPORT']);

interface IFindFreePortParams {
  from: number;
  exclude: Set<number>;
}

export async function findFreePort({
  from,
  exclude,
}: IFindFreePortParams): Promise<number> {
  for (let port = from; port < 65_536; port += 1) {
    if (!exclude.has(port) && (await isPortFree(port))) {
      return port;
    }
  }

  throw new Error(`No free port found from ${from}.`);
}

async function isPortFree(port: number): Promise<boolean> {
  for (const host of loopbackHosts) {
    if (!(await isPortFreeOn(port, host))) {
      return false;
    }
  }

  return true;
}

function isPortFreeOn(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (error: NodeJS.ErrnoException) => {
      resolve(unavailableAddressCodes.has(error.code ?? ''));
    });
    server.listen(port, host, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}
