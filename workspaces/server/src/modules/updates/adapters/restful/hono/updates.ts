import { Hono } from 'hono';

import type { TContext } from '#/adapters/restful/context';

import { FindUpdateQuery } from '../../../application/queries';

export const updateEndpoints = new Hono<TContext>().get(
  '/:target/:arch/:version',
  async (c) => {
    const update = await c.var.cqrsx.exec(
      new FindUpdateQuery({
        target: c.req.param('target'),
        arch: c.req.param('arch'),
        version: c.req.param('version'),
      }),
    );

    if (!update) {
      return c.body(null, 204);
    }

    const url = new URL(`/download/${update.key}`, c.req.url);

    return c.json({
      version: update.version,
      notes: update.notes,
      // biome-ignore lint/style/useNamingConvention: Tauri updater response field.
      pub_date: update.pubDate,
      url: url.toString(),
      signature: update.signature,
    });
  },
);
