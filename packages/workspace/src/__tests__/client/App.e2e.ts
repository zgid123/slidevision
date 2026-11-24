import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from 'playwright';

import { type IWorkspace, startWorkspace } from '../../startWorkspace';
import { deckFactory } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

describe('#App', () => {
  let workspace: ITestWorkspace;
  let started: IWorkspace;
  let browser: Browser;
  let context: BrowserContext;
  let landingPage: Page;

  const card = (id: string) => {
    return landingPage.locator(`[data-deck-id="${id}"]`);
  };

  const openDeckTab = async (id: string): Promise<Page> => {
    const tab = context.waitForEvent('page');

    await card(id).getByRole('button').click();

    const deckTab = await tab;

    await deckTab.waitForURL(/^http:\/\/localhost:\d+\/(\d+)?$/);
    await deckTab.getByText('First slide').waitFor();

    return deckTab;
  };

  beforeAll(async () => {
    workspace = await workspaceFactory.withSlidev().create({
      decks: [
        deckFactory.build({
          folder: 'decks/alpha',
        }),
        deckFactory.build({
          folder: 'decks/beta',
        }),
        deckFactory.withMissingTheme().build({
          folder: 'decks/broken',
        }),
      ],
    });
    started = await startWorkspace({
      root: workspace.root,
      port: 0,
    });
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
    await started.close();
    await removeWorkspace(workspace);
  });

  beforeEach(async () => {
    context = await browser.newContext();
    landingPage = await context.newPage();
    await landingPage.goto(started.server.resolvedUrls?.local[0] ?? '');
  });

  afterEach(async () => {
    await context.close();
  });

  suite('when a stopped deck is opened', () => {
    it('opens the deck in a new tab and marks the card running', async () => {
      const deckTab = await openDeckTab('decks/alpha');

      await card('decks/alpha')
        .locator('[data-status]', {
          hasText: 'Running',
        })
        .waitFor();

      expect({
        landingPageOpen: !landingPage.isClosed(),
        deckOrigin:
          new URL(deckTab.url()).origin !== new URL(landingPage.url()).origin,
      }).toEqual({
        landingPageOpen: true,
        deckOrigin: true,
      });
    });
  });

  suite('when a deck cannot start', () => {
    it('shows the failure and its error on the card', async () => {
      await card('decks/broken').getByRole('button').click();
      await card('decks/broken')
        .locator('[data-status]', {
          hasText: 'Failed',
        })
        .waitFor();

      expect({
        error: await card('decks/broken').locator('[data-error]').textContent(),
        button: await card('decks/broken').getByRole('button').textContent(),
      }).toEqual({
        error: expect.stringContaining('slidevision-missing-theme'),
        button: expect.stringContaining('Retry'),
      });
    });
  });

  suite('when an open deck is edited', () => {
    it('updates the deck tab without reloading it', async () => {
      const deckTab = await openDeckTab('decks/beta');
      const entry = join(workspace.root, 'decks/beta/slides.md');

      await deckTab.evaluate(() => {
        Reflect.set(window, 'slidevisionMarker', true);
      });
      await writeFile(
        entry,
        (await readFile(entry, 'utf8')).replace(
          '# First slide',
          '# Edited slide',
        ),
      );
      await deckTab.getByText('Edited slide').waitFor();

      expect(
        await deckTab.evaluate(() => {
          return Reflect.get(window, 'slidevisionMarker');
        }),
      ).toEqual(true);
    });
  });
});
