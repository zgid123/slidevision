<script setup lang="ts">
import { ref } from 'vue';

import { coverSrc } from '../utils/coverSrc';
import type { IDeck } from '@contracts/project';

defineProps<{
  deck: IDeck;
}>();

defineEmits<{
  open: [];
}>();

const hasCoverError = ref(false);
</script>

<template>
  <button
    type="button"
    class="w-full overflow-hidden rounded-lg border border-stroke-primary bg-primary p-0 text-left hover:border-stroke-tertiary"
    :data-deck-id="deck.id"
    @click="$emit('open')"
  >
    <div class="aspect-video bg-tertiary">
      <img
        v-if="deck.cover && !hasCoverError"
        :src="coverSrc(deck.cover)"
        :alt="`Cover of ${deck.name}`"
        class="h-full w-full object-cover"
        @error="hasCoverError = true"
      >
      <div
        v-else
        class="flex h-full items-center justify-center p-6 text-center text-xl font-semibold"
      >
        {{ deck.name }}
      </div>
    </div>
    <h2 class="m-0 truncate p-4 text-base font-medium" :title="deck.name">
      {{ deck.name }}
    </h2>
  </button>
</template>
