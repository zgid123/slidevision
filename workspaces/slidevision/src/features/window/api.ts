import { getCurrentWindow } from '@tauri-apps/api/window';

import { type TThemePreference, themePreference } from './interface';

interface ISetThemeParams {
  preference: TThemePreference;
}

export interface IWindowApi {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  setTheme: (params: ISetThemeParams) => Promise<void>;
}

export const windowApi: IWindowApi = {
  close: () => getCurrentWindow().close(),
  minimize: () => getCurrentWindow().minimize(),
  toggleMaximize: () => getCurrentWindow().toggleMaximize(),
  setTheme: ({ preference }) => {
    return getCurrentWindow().setTheme(
      preference === themePreference.system ? null : preference,
    );
  },
};
