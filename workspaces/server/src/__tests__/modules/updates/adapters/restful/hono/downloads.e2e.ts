import { InMemoryReleaseRepository } from '#/__tests__/fakes/InMemoryReleaseRepository';
import { createApp, type TApp } from '#/adapters/restful/hono';

const ORIGIN = 'https://updates.example.com';

describe('#downloadEndpoints', () => {
  let releases: InMemoryReleaseRepository;
  let app: TApp;

  beforeEach(() => {
    releases = new InMemoryReleaseRepository();
    app = createApp({
      releaseRepository: releases,
    });
  });

  function get(path: string): Promise<Response> {
    return Promise.resolve(app.request(`${ORIGIN}${path}`));
  }

  describe('GET /download/*', () => {
    suite('when the file exists', () => {
      it('streams it as an attachment', async () => {
        releases.putFile({
          key: 'darwin/0.2.0/Slidevision-darwin-aarch64.app.tar.gz',
          bytes: new Uint8Array([1, 2, 3]),
        });

        const response = await get(
          '/download/darwin/0.2.0/Slidevision-darwin-aarch64.app.tar.gz',
        );

        expect(response.status).toEqual(200);
        expect(response.headers.get('Content-Length')).toEqual('3');
        expect(response.headers.get('Content-Disposition')).toEqual(
          'attachment; filename="Slidevision-darwin-aarch64.app.tar.gz"',
        );
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(
          new Uint8Array([1, 2, 3]),
        );
      });
    });

    suite('when the file does not exist', () => {
      it('returns not found', async () => {
        const response = await get(
          '/download/darwin/9.9.9/Slidevision-darwin-aarch64.app.tar.gz',
        );

        expect(response.status).toEqual(404);
      });
    });

    suite('when the key is outside the target folders', () => {
      it('returns not found, so manifests are never served', async () => {
        releases.putFile({
          key: 'manifests/darwin.json',
          bytes: new Uint8Array([1]),
        });

        const response = await get('/download/manifests/darwin.json');

        expect(response.status).toEqual(404);
      });
    });
  });
});
