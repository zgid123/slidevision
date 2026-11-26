import { Cqrsx } from '@cqrsx/core';
import { Hono } from 'hono';

import { UpdateError, updateErrorCode } from '#/modules/updates/domain/errors';
import type { IReleaseRepository } from '#/modules/updates/domain/repositories';

import type { TContext } from '../context';
import { wire } from '../wire';
import { endpoints } from './endpoints';

export type TApp = Hono<TContext>;

export interface ICreateAppParams {
  readonly releaseRepository: IReleaseRepository;
}

export function createApp({ releaseRepository }: ICreateAppParams): TApp {
  const container = wire({
    cqrsx: new Cqrsx(),
    releaseRepository,
  });

  return new Hono<TContext>()
    .use(async (c, next) => {
      c.set('cqrsx', container.cqrsx);

      await next();
    })
    .route('/', endpoints)
    .onError((error, c) => {
      if (error instanceof UpdateError) {
        const status = error.code === updateErrorCode.notFound ? 404 : 400;

        return c.json(
          {
            error: error.code,
            message: error.message,
          },
          status,
        );
      }

      console.error(error);

      return c.json(
        {
          error: 'internal_error',
        },
        500,
      );
    });
}
