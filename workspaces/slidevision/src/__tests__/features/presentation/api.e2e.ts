import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';

import {
  presentationApi,
  presentationChangedEvent,
} from '#/features/presentation/api';

describe('#presentationApi', () => {
  afterEach(() => {
    clearMocks();
  });

  describe('.play', () => {
    it('invokes play with the deck URL and slide', async () => {
      const invocations: unknown[] = [];

      mockIPC((command, args) => {
        invocations.push([command, args]);
      });

      await presentationApi.play({
        url: 'http://localhost:3031/',
        slide: 3,
      });

      expect(invocations).toEqual([
        [
          'play',
          {
            url: 'http://localhost:3031/',
            slide: 3,
          },
        ],
      ]);
    });

    it('rejects with the shell error', async () => {
      mockIPC(() => {
        throw 'No display was found to present on.';
      });

      await expect(
        presentationApi.play({
          url: 'http://localhost:3031/',
          slide: 1,
        }),
      ).rejects.toBe('No display was found to present on.');
    });
  });

  describe('.onPresentationChanged', () => {
    it('reports when a presentation starts and ends', async () => {
      const listener = vi.fn();

      mockIPC(() => null, {
        shouldMockEvents: true,
      });

      const stop = await presentationApi.onPresentationChanged(listener);

      await emit(presentationChangedEvent, true);
      await emit(presentationChangedEvent, false);

      expect(listener.mock.calls).toEqual([[true], [false]]);

      stop();
    });
  });
});
