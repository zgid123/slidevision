import type { IWindowApi } from '#/features/window/api';
import type { TThemePreference } from '#/features/window/interface';

interface ISetThemeParams {
  preference: TThemePreference;
}

export class FakeWindowApi implements IWindowApi {
  public themes: TThemePreference[] = [];

  public close = async (): Promise<void> => {};

  public minimize = async (): Promise<void> => {};

  public toggleMaximize = async (): Promise<void> => {};

  public setTheme = async ({ preference }: ISetThemeParams): Promise<void> => {
    this.themes.push(preference);
  };
}
