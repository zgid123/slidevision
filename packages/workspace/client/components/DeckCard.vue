<script setup lang="ts">
import { ref } from 'vue';

import { deckStatus, type IDeckSummary, type TDeckStatus } from '../shared';

defineProps<{
  deck: IDeckSummary;
}>();

const statusLabels: Record<TDeckStatus, string> = {
  [deckStatus.stopped]: 'Stopped',
  [deckStatus.starting]: 'Starting',
  [deckStatus.running]: 'Running',
  [deckStatus.failed]: 'Failed',
};

const hasCoverError = ref(false);
</script>

<template>
  <article
    class="overflow-hidden rounded-lg border border-stroke-primary bg-primary"
  >
    <div class="aspect-video bg-tertiary">
      <img
        v-if="deck.coverUrl && !hasCoverError"
        :src="deck.coverUrl"
        :alt="`Cover of ${deck.name}`"
        class="h-full w-full object-cover"
        @error="hasCoverError = true"
      >
      <div
        v-else
        class="flex h-full items-center justify-center p-6 text-center text-xl font-semibold"
        data-title-card
      >
        {{ deck.name }}
      </div>
    </div>
    <div class="flex items-center justify-between gap-4 p-4">
      <div class="min-w-0">
        <h2 class="truncate font-medium" :title="deck.name">{{ deck.name }}</h2>
        <p class="text-sm text-foreground-tertiary">
          {{ statusLabels[deck.status] }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-md border border-stroke-secondary px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:text-foreground-tertiary"
        disabled
        title="Opening decks is not available yet"
      >
        Open
      </button>
    </div>
  </article>
</template>
