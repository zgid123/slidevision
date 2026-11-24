<script setup lang="ts">
import { ref } from 'vue';

import { deckStatus, type IDeckSummary, type TDeckStatus } from '../shared';

defineProps<{
  deck: IDeckSummary;
}>();

defineEmits<{
  open: [];
}>();

const statusLabels: Record<TDeckStatus, string> = {
  [deckStatus.stopped]: 'Stopped',
  [deckStatus.starting]: 'Starting…',
  [deckStatus.running]: 'Running',
  [deckStatus.failed]: 'Failed',
};

const statusClasses: Record<TDeckStatus, string> = {
  [deckStatus.stopped]: 'text-foreground-tertiary',
  [deckStatus.starting]: 'text-amber-700',
  [deckStatus.running]: 'text-green-700',
  [deckStatus.failed]: 'text-red-700',
};

const hasCoverError = ref(false);
</script>

<template>
  <article
    class="overflow-hidden rounded-lg border border-stroke-primary bg-primary"
    :data-deck-id="deck.id"
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
        <p class="text-sm" :class="statusClasses[deck.status]" data-status>
          {{ statusLabels[deck.status] }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-md border border-stroke-secondary px-3 py-1.5 text-sm hover:bg-secondary disabled:cursor-wait disabled:text-foreground-tertiary"
        :disabled="deck.status === deckStatus.starting"
        @click="$emit('open')"
      >
        {{ deck.status === deckStatus.failed ? 'Retry' : 'Open' }}
      </button>
    </div>
    <pre
      v-if="deck.status === deckStatus.failed && deck.error"
      class="m-0 max-h-48 overflow-auto border-t border-stroke-primary bg-secondary p-4 text-xs whitespace-pre-wrap text-red-700"
      role="alert"
      data-error
    >{{ deck.error }}</pre>
  </article>
</template>
