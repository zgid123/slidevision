import { deckStatus, type IDeckRun } from '@contracts/project';
import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import { deckRunEvent, decksApi } from '#/features/decks/api';

describe('#decksApi', () => {
  afterEach(() => {
    clearMocks();
  });

  describe('.startDeck', () => {
    it('invokes start_deck with the deck id and returns the run', async () => {
      const run: IDeckRun = {
        id: 'decks/alpha',
        status: deckStatus.running,
        url: 'http://localhost:3030/',
      };
      const invocations: unknown[] = [];

      mockIPC((command, args) => {
        invocations.push([command, args]);

        return run;
      });

      const result = await decksApi.startDeck({
        id: 'decks/alpha',
      });

      expect(result).toEqual(run);
      expect(invocations).toEqual([
        [
          'start_deck',
          {
            id: 'decks/alpha',
          },
        ],
      ]);
    });
  });

  describe('.onDeckRun', () => {
    it('passes each deck-run event to the listener', async () => {
      const run: IDeckRun = {
        id: 'decks/alpha',
        status: deckStatus.failed,
        error: 'Slidev stopped unexpectedly (exit code 1).',
      };
      const listener = vi.fn();

      mockIPC(() => null, {
        shouldMockEvents: true,
      });

      const stop = await decksApi.onDeckRun(listener);

      await emit(deckRunEvent, run);

      expect(listener).toHaveBeenCalledWith(run);

      stop();
    });
  });
});
