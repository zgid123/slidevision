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
    it('renders the cover image, the title card fallback, statuses, and disabled Open buttons', async () => {
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
        statuses: html.match(/>Stopped</g)?.length,
        disabledOpenButtons: html.match(/<button[^>]*disabled[^>]*>\s*Open/g)
          ?.length,
      }).toEqual({
        cover: true,
        titleCard: true,
        statuses: 2,
        disabledOpenButtons: 2,
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
