export const themePreference = {
  system: 'system',
  light: 'light',
  dark: 'dark',
} as const;

export type TThemePreference =
  (typeof themePreference)[keyof typeof themePreference];
