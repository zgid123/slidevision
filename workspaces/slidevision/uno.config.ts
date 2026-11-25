import { defineConfig, presetWind4 } from 'unocss';

const roleShades = {
  primary: 50,
  secondary: 100,
  tertiary: 200,
  'stroke-primary': 200,
  'stroke-secondary': 300,
  'stroke-tertiary': 400,
  'foreground-primary': 950,
  'foreground-secondary': 600,
  'foreground-tertiary': 500,
} as const;

export default defineConfig({
  presets: [presetWind4()],
  extendTheme: (theme) => {
    const colors = theme.colors;
    const neutral = colors?.neutral;

    if (!colors || typeof neutral !== 'object') {
      return;
    }

    for (const [role, shade] of Object.entries(roleShades)) {
      const value = neutral[shade];

      if (value !== undefined) {
        colors[role] = value;
      }
    }
  },
});
