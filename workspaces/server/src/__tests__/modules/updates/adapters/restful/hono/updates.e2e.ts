import { releaseManifestFactory } from '#/__tests__/factories/ReleaseManifestFactory';
import { InMemoryReleaseRepository } from '#/__tests__/fakes/InMemoryReleaseRepository';
import { createApp, type TApp } from '#/adapters/restful/hono';

const ORIGIN = 'https://updates.example.com';

describe('#updateEndpoints', () => {
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

  describe('GET /v1/updates/:target/:arch/:version', () => {
    suite('when a newer release exists for the build', () => {
      it('returns the Tauri update with a download URL on this server', async () => {
        const manifest = releaseManifestFactory.build();

        releases.putManifest({
          target: 'darwin',
          manifest,
        });

        const response = await get('/v1/updates/darwin/aarch64/0.1.0');

        expect(response.status).toEqual(200);
        expect(await response.json()).toEqual({
          version: '0.2.0',
          notes: manifest.notes,
          // biome-ignore lint/style/useNamingConvention: Tauri updater response field.
          pub_date: manifest.pubDate,
          url: `${ORIGIN}/download/darwin/0.2.0/Slidevision-darwin-aarch64.app.tar.gz`,
          signature: manifest.files.aarch64?.signature,
        });
      });
    });

    suite('when the release has an Apple silicon and an Intel build', () => {
      it('sends each Mac its own build', async () => {
        const manifest = releaseManifestFactory
          .params({
            version: '0.3.0',
          })
          .withIntel()
          .build();

        releases.putManifest({
          target: 'darwin',
          manifest,
        });

        const intel = await get('/v1/updates/darwin/x86_64/0.2.1');
        const appleSilicon = await get('/v1/updates/darwin/aarch64/0.2.1');

        expect(await intel.json()).toMatchObject({
          url: `${ORIGIN}/download/darwin/0.3.0/Slidevision-darwin-x86_64.app.tar.gz`,
          signature: manifest.files.x86_64?.signature,
        });
        expect(await appleSilicon.json()).toMatchObject({
          url: `${ORIGIN}/download/darwin/0.3.0/Slidevision-darwin-aarch64.app.tar.gz`,
          signature: manifest.files.aarch64?.signature,
        });
      });
    });

    suite('when the app is on the latest release', () => {
      it('returns no content', async () => {
        releases.putManifest({
          target: 'darwin',
          manifest: releaseManifestFactory.build(),
        });

        const response = await get('/v1/updates/darwin/aarch64/0.2.0');

        expect(response.status).toEqual(204);
      });
    });

    suite('when the app is newer than the latest release', () => {
      it('returns no content', async () => {
        releases.putManifest({
          target: 'darwin',
          manifest: releaseManifestFactory.build(),
        });

        const response = await get('/v1/updates/darwin/aarch64/0.3.0');

        expect(response.status).toEqual(204);
      });
    });

    suite('when nothing was released for the target', () => {
      it('returns no content', async () => {
        const response = await get('/v1/updates/windows/x86_64/0.1.0');

        expect(response.status).toEqual(204);
      });
    });

    suite('when the release has no file for the architecture', () => {
      it('returns no content', async () => {
        releases.putManifest({
          target: 'darwin',
          manifest: releaseManifestFactory.withoutFiles().build(),
        });

        const response = await get('/v1/updates/darwin/aarch64/0.1.0');

        expect(response.status).toEqual(204);
      });
    });

    suite('when the target is not shipped', () => {
      it('returns not found', async () => {
        const response = await get('/v1/updates/linux/x86_64/0.1.0');

        expect(response.status).toEqual(404);
      });
    });

    suite('when the architecture is not built for the target', () => {
      it('returns not found', async () => {
        const response = await get('/v1/updates/windows/aarch64/0.1.0');

        expect(response.status).toEqual(404);
      });
    });

    suite('when the version is invalid', () => {
      it('returns bad request', async () => {
        const response = await get('/v1/updates/darwin/aarch64/soon');

        expect(response.status).toEqual(400);
      });
    });
  });
});
