<script setup lang="ts">
import { themePreference, type TThemePreference } from '../interface';

defineProps<{
  preference: TThemePreference;
}>();

defineEmits<{
  choose: [preference: TThemePreference];
}>();

const options = [
  {
    preference: themePreference.system,
    label: 'System',
    icon: 'i-lucide-monitor',
  },
  {
    preference: themePreference.light,
    label: 'Light',
    icon: 'i-lucide-sun',
  },
  {
    preference: themePreference.dark,
    label: 'Dark',
    icon: 'i-lucide-moon',
  },
] as const;
</script>

<template>
  <fieldset
    class="m-0 flex shrink-0 items-center gap-0.5 rounded-lg border-0 bg-tertiary p-0.5"
  >
    <legend class="sr-only">Appearance</legend>
    <button
      v-for="option in options"
      :key="option.preference"
      type="button"
      class="flex size-6 cursor-pointer items-center justify-center rounded-md border-0 p-0 focus-visible:outline-2 focus-visible:outline-indigo-500 motion-safe:transition-colors"
      :class="
        option.preference === preference
          ? 'bg-primary text-foreground-primary shadow-sm'
          : 'bg-transparent text-foreground-secondary hover:text-foreground-primary'
      "
      :aria-pressed="option.preference === preference"
      :aria-label="option.label"
      :title="option.label"
      @click="$emit('choose', option.preference)"
    >
      <span :class="option.icon" class="text-sm" aria-hidden="true" />
    </button>
  </fieldset>
</template>
