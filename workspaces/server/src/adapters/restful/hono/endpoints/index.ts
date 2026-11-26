import { Hono } from 'hono';

import { downloadEndpoints } from '#/modules/updates/adapters/restful/hono/downloads';
import { updateEndpoints } from '#/modules/updates/adapters/restful/hono/updates';

import type { TContext } from '../../context';

export const endpoints = new Hono<TContext>()
  .route('/v1/updates', updateEndpoints)
  .route('/download', downloadEndpoints);
