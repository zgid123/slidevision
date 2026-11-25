<script setup lang="ts">
import type { IDeck } from '@contracts/project';

defineProps<{
  deck: IDeck;
  canGoBack: boolean;
}>();

defineEmits<{
  back: [];
}>();
</script>

<template>
  <section>
    <div class="mb-6 flex items-center gap-4">
      <button
        v-if="canGoBack"
        type="button"
        class="rounded-md border border-stroke-secondary px-3 py-1.5 text-sm hover:bg-tertiary"
        @click="$emit('back')"
      >
        ← All decks
      </button>
      <h2 class="m-0 truncate text-xl font-semibold">{{ deck.name }}</h2>
    </div>
    <p class="text-sm text-foreground-secondary">{{ deck.entry }}</p>
  </section>
</template>
