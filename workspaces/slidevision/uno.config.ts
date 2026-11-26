import { defineConfig, presetIcons, presetWind4 } from 'unocss';

const roleShades = {
  primary: {
    light: 50,
    dark: 900,
  },
  secondary: {
    light: 100,
    dark: 950,
  },
  tertiary: {
    light: 200,
    dark: 800,
  },
  'stroke-primary': {
    light: 200,
    dark: 800,
  },
  'stroke-secondary': {
    light: 300,
    dark: 700,
  },
  'stroke-tertiary': {
    light: 400,
    dark: 600,
  },
  'foreground-primary': {
    light: 950,
    dark: 50,
  },
  'foreground-secondary': {
    light: 600,
    dark: 400,
  },
  'foreground-tertiary': {
    light: 500,
    dark: 500,
  },
} as const;

const windowControlColors = {
  'window-close': '#ff5f57',
  'window-minimize': '#febc2e',
  'window-maximize': '#28c840',
} as const;

type TScheme = 'light' | 'dark';

type TShades = Record<number, string>;

const neutralOf = (colors: unknown): TShades | undefined => {
  if (typeof colors !== 'object' || colors === null || !('neutral' in colors)) {
    return undefined;
  }

  const { neutral } = colors;

  return typeof neutral === 'object' && neutral !== null
    ? (neutral as TShades)
    : undefined;
};

const roleVariables = (neutral: TShades, scheme: TScheme): string => {
  return Object.entries(roleShades)
    .map(([role, shades]) => {
      return `--colors-${role}:${neutral[shades[scheme]]};`;
    })
    .join('');
};

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'media',
    }),
    presetIcons({
      collections: {
        lucide: async () => {
          const icons = await import('@iconify-json/lucide/icons.json', {
            with: {
              type: 'json',
            },
          });

          return icons.default;
        },
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        flex: 'none',
      },
    }),
  ],
  extendTheme: (theme) => {
    const neutral = neutralOf(theme.colors);

    if (!theme.colors || !neutral) {
      return;
    }

    for (const [role, shades] of Object.entries(roleShades)) {
      theme.colors[role] = neutral[shades.light];
    }

    Object.assign(theme.colors, windowControlColors);
  },
  shortcuts: {
    btn: 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border-0 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-default disabled:opacity-45 motion-safe:transition-colors',
    'btn-primary':
      'btn bg-indigo-600 font-semibold text-white enabled:hover:bg-indigo-700',
    'btn-ghost':
      'btn bg-transparent text-foreground-secondary hover:bg-tertiary hover:text-foreground-primary',
  },
  preflights: [
    {
      layer: 'theme-schemes',
      getCSS: ({ theme }) => {
        const neutral = neutralOf(theme.colors);

        if (!neutral) {
          return undefined;
        }

        return [
          `:root{color-scheme:light dark;${roleVariables(neutral, 'light')}}`,
          `@media (prefers-color-scheme: dark){:root{${roleVariables(neutral, 'dark')}}}`,
          '*{scrollbar-width:none;}',
          '*::-webkit-scrollbar{display:none;}',
        ].join('');
      },
    },
  ],
  layers: {
    'theme-schemes': 0.5,
  },
});
