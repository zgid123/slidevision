import { type Browser, chromium, type Page } from 'playwright';

import { DeckServers } from '../../server/DeckServers';
import { findDecks } from '../../utils/findDecks';
import { deckFactory } from '../factories/DeckFactory';
import {
  type ITestWorkspace,
  removeWorkspace,
  workspaceFactory,
} from '../factories/WorkspaceFactory';

const slidesSource = [
  '---',
  'theme: none',
  '---',
  '',
  '# Opening',
  '',
  '<v-click><p>Opening point</p></v-click>',
  '',
  '---',
  '',
  '# Middle',
  '',
  '---',
  '',
  '# Closing',
  '',
].join('\n');

describe('Slidevision overview page', () => {
  let workspace: ITestWorkspace;
  let deckServers: DeckServers;
  let browser: Browser;
  let url: string;

  const openPage = async (path: string): Promise<Page> => {
    const page = await browser.newPage();

    await page.goto(new URL(path, url).href);

    return page;
  };

  beforeAll(async () => {
    workspace = await workspaceFactory.withSlidev().create({
      decks: [
        deckFactory.build({
          folder: 'decks/alpha',
          files: {
            'slides.md': slidesSource,
          },
        }),
      ],
    });
    deckServers = new DeckServers({
      root: workspace.root,
      decks: await findDecks({
        root: workspace.root,
        patterns: ['decks/*'],
      }),
    });
    url =
      (
        await deckServers.open({
          id: 'decks/alpha',
        })
      ).url ?? '';
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
    await deckServers.stopAll();
    await removeWorkspace(workspace);
  });

  it('shows every slide in order, fully revealed, with the first selected', async () => {
    const page = await openPage('__slidevision-overview?print&embedded=true');
    const cards = page.locator('[data-slide-no]');

    await cards.nth(2).waitFor();

    expect(
      await cards.evaluateAll((elements) => {
        return elements.map((element) => {
          return [
            element.getAttribute('data-slide-no'),
            element.getAttribute('aria-pressed'),
          ];
        });
      }),
    ).toEqual([
      ['1', 'true'],
      ['2', 'false'],
      ['3', 'false'],
    ]);
    expect(
      await page.locator('.slidevision-card__title').allTextContents(),
    ).toEqual(['Opening', 'Middle', 'Closing']);
    await expect(
      page.getByText('Opening point').waitFor({
        state: 'visible',
        timeout: 10_000,
      }),
    ).resolves.toBeUndefined();
  });

  it('selects a clicked slide, tells its parent, and leaves the presenter alone', async () => {
    const presenter = await openPage('presenter/1');

    await presenter.getByText('Opening', { exact: true }).first().waitFor();

    const page = await openPage('__slidevision-overview?print&embedded=true');

    await page.evaluate(() => {
      (window as unknown as { messages: unknown[] }).messages = [];
      window.addEventListener('message', (event) => {
        (window as unknown as { messages: unknown[] }).messages.push(
          event.data,
        );
      });
    });
    await page.locator('[data-slide-no="3"]').click();
    await page.waitForTimeout(1_000);

    expect(
      await page.locator('[data-slide-no="3"]').getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      await page.evaluate(() => {
        return (window as unknown as { messages: unknown[] }).messages;
      }),
    ).toEqual([
      {
        source: 'slidevision',
        type: 'select',
        no: 3,
      },
    ]);
    expect(new URL(presenter.url()).pathname).toBe('/presenter/1');
  });
});
