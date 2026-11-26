import { createApp, type TApp } from '#/adapters/restful/hono';
import { ReleaseRepository } from '#/modules/updates/infrastructure/r2';

interface IEnv {
  readonly RELEASES: R2Bucket;
}

let app: TApp | undefined;

export default {
  fetch(
    request: Request,
    env: IEnv,
    context: ExecutionContext,
  ): Response | Promise<Response> {
    app ??= createApp({
      releaseRepository: new ReleaseRepository({
        bucket: env.RELEASES,
      }),
    });

    return app.fetch(request, env, context);
  },
};
