import vue from '@vitejs/plugin-vue';
import { createServer, type ViteDevServer } from 'vite';
import { type Component, createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

import type { IDeckSummary } from '../../../../client/shared';
import { clientDir } from '../../../paths';

describe('#DeckList', () => {
  let vite: ViteDevServer;

  const render = async (decks: IDeckSummary[]): Promise<string> => {
    const module = await vite.ssrLoadModule('/components/DeckList.vue');
    const app = createSSRApp(module.default as Component, {
      decks,
    });

    return renderToString(app);
  };

  beforeAll(async () => {
    vite = await createServer({
      root: clientDir,
      configFile: false,
      envDir: false,
      logLevel: 'silent',
      appType: 'custom',
      server: {
        middlewareMode: true,
        ws: false,
      },
      plugins: [vue()],
    });
  });

  afterAll(async () => {
    await vite.close();
  });

  suite('when one deck has a cover and one does not', () => {
    it('renders the cover image and the title card fallback', async () => {
      const html = await render([
        {
          id: 'decks/alpha',
          name: 'Alpha talk',
          status: 'stopped',
          coverUrl: '/__slidevision/api/decks/decks%2Falpha/cover',
        },
        {
          id: 'decks/gamma',
          name: 'Gamma talk',
          status: 'stopped',
        },
      ]);

      expect({
        cover: html.includes(
          'src="/__slidevision/api/decks/decks%2Falpha/cover"',
        ),
        titleCard: /data-title-card[^>]*>\s*Gamma talk/.test(html),
        statuses: html.match(/>\s*Stopped\s*</g)?.length,
      }).toEqual({
        cover: true,
        titleCard: true,
        statuses: 2,
      });
    });
  });

  suite('when a deck is starting', () => {
    it('disables its Open button', async () => {
      const html = await render([
        {
          id: 'decks/alpha',
          name: 'Alpha talk',
          status: 'starting',
        },
      ]);

      expect(/<button[^>]*disabled[^>]*>\s*Open/.test(html)).toEqual(true);
    });
  });

  suite('when a deck failed to start', () => {
    it('shows the error and offers a retry', async () => {
      const html = await render([
        {
          id: 'decks/alpha',
          name: 'Alpha talk',
          status: 'failed',
          error: 'Slidev exited before the deck was ready.',
        },
      ]);

      expect({
        error:
          /data-error[^>]*>Slidev exited before the deck was ready\.</.test(
            html,
          ),
        retry: /<button[^>]*>\s*Retry\s*</.test(html),
      }).toEqual({
        error: true,
        retry: true,
      });
    });
  });

  suite('when there are no decks', () => {
    it('renders the empty state', async () => {
      const html = await render([]);

      expect(html).toContain('No decks found');
    });
  });
});
