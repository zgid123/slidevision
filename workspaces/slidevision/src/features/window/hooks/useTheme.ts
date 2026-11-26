import { reactive } from 'vue';

import type { IWindowApi } from '../api';
import { type TThemePreference, themePreference } from '../interface';

type TThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

interface IUseThemeParams {
  api: IWindowApi;
  storage: TThemeStorage;
}

interface IChooseParams {
  preference: TThemePreference;
}

export interface ITheme {
  readonly preference: TThemePreference;
  restore: () => Promise<void>;
  choose: (params: IChooseParams) => Promise<void>;
}

export const themeStorageKey = 'slidevision:theme';

const isThemePreference = (value: string | null): value is TThemePreference => {
  return Object.values<string | null>(themePreference).includes(value);
};

export function useTheme({ api, storage }: IUseThemeParams): ITheme {
  const state = reactive<{
    preference: TThemePreference;
  }>({
    preference: themePreference.system,
  });

  const restore = async (): Promise<void> => {
    const stored = storage.getItem(themeStorageKey);

    if (!isThemePreference(stored) || stored === themePreference.system) {
      return;
    }

    state.preference = stored;

    await api.setTheme({
      preference: stored,
    });
  };

  const choose = async ({ preference }: IChooseParams): Promise<void> => {
    state.preference = preference;
    storage.setItem(themeStorageKey, preference);

    await api.setTheme({
      preference,
    });
  };

  return {
    get preference() {
      return state.preference;
    },
    restore,
    choose,
  };
}
