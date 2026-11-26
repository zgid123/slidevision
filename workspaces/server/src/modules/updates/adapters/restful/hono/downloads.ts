import { Hono } from 'hono';

import type { TContext } from '#/adapters/restful/context';

import { GetDownloadQuery } from '../../../application/queries';

export const downloadEndpoints = new Hono<TContext>().get('/*', async (c) => {
  const key = decodeURIComponent(c.req.path.replace(/^\/download\//, ''));

  const download = await c.var.cqrsx.exec(
    new GetDownloadQuery({
      key,
    }),
  );

  const fileName = key.split('/').pop() ?? 'download';

  return c.body(download.body, 200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': String(download.size),
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });
});
