import {
  type ITheme,
  themeStorageKey,
  useTheme,
} from '#/features/window/hooks/useTheme';
import { themePreference } from '#/features/window/interface';

import { FakeWindowApi } from '../../../fakes/FakeWindowApi';

describe('#useTheme', () => {
  let api: FakeWindowApi;
  let stored: Map<string, string>;
  let theme: ITheme;

  beforeEach(() => {
    api = new FakeWindowApi();
    stored = new Map();
    theme = useTheme({
      api,
      storage: {
        getItem: (key) => stored.get(key) ?? null,
        setItem: (key, value) => {
          stored.set(key, value);
        },
      },
    });
  });

  it('follows the system by default', () => {
    expect(theme.preference).toBe(themePreference.system);
  });

  describe('.restore', () => {
    suite('when nothing was chosen before', () => {
      it('keeps following the system', async () => {
        await theme.restore();

        expect(theme.preference).toBe(themePreference.system);
        expect(api.themes).toEqual([]);
      });
    });

    suite('when dark was chosen before', () => {
      it('applies dark to the window', async () => {
        stored.set(themeStorageKey, themePreference.dark);

        await theme.restore();

        expect(theme.preference).toBe(themePreference.dark);
        expect(api.themes).toEqual([themePreference.dark]);
      });
    });

    suite('when the stored value is unknown', () => {
      it('keeps following the system', async () => {
        stored.set(themeStorageKey, 'sepia');

        await theme.restore();

        expect(theme.preference).toBe(themePreference.system);
        expect(api.themes).toEqual([]);
      });
    });
  });

  describe('.choose', () => {
    it('applies and remembers the choice', async () => {
      await theme.choose({
        preference: themePreference.light,
      });

      expect(theme.preference).toBe(themePreference.light);
      expect(api.themes).toEqual([themePreference.light]);
      expect(stored.get(themeStorageKey)).toBe(themePreference.light);
    });

    suite('when going back to the system', () => {
      it('hands the theme back to the device', async () => {
        await theme.choose({
          preference: themePreference.dark,
        });
        await theme.choose({
          preference: themePreference.system,
        });

        expect(api.themes).toEqual([
          themePreference.dark,
          themePreference.system,
        ]);
        expect(stored.get(themeStorageKey)).toBe(themePreference.system);
      });
    });
  });
});
