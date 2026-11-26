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
    class="block w-full cursor-pointer overflow-hidden rounded-xl border border-stroke-primary bg-primary p-0 text-left text-inherit hover:border-stroke-tertiary hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 motion-safe:transition-[border-color,box-shadow]"
    :data-deck-id="deck.id"
    @click="$emit('open')"
  >
    <div class="aspect-video border-b border-stroke-primary bg-tertiary">
      <img
        v-if="deck.cover && !hasCoverError"
        :src="coverSrc(deck.cover)"
        :alt="`Cover of ${deck.name}`"
        class="h-full w-full object-cover"
        @error="hasCoverError = true"
      >
      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-foreground-secondary"
        aria-hidden="true"
      >
        <span class="i-lucide-presentation text-3xl" />
        <span class="line-clamp-2 text-lg font-semibold">{{ deck.name }}</span>
      </div>
    </div>
    <div class="px-3.5 pt-3 pb-3.5">
      <h3 class="m-0 truncate text-sm font-semibold" :title="deck.name">
        {{ deck.name }}
      </h3>
      <p
        class="m-0 truncate text-xs text-foreground-secondary"
        :title="deck.dir"
      >
        {{ deck.id }}
      </p>
    </div>
  </button>
</template>
