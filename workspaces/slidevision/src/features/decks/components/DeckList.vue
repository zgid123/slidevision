<script setup lang="ts">
import type { IDeck } from '@contracts/project';
import DeckCard from './DeckCard.vue';

defineProps<{
  decks: IDeck[];
}>();

defineEmits<{
  open: [deck: IDeck];
}>();
</script>

<template>
  <section
    v-if="decks.length === 0"
    class="mt-6 flex flex-col items-center gap-2.5 rounded-2xl border-1.5 border-dashed border-stroke-secondary px-8 py-14 text-center"
  >
    <span
      class="flex size-12 items-center justify-center rounded-xl bg-tertiary text-foreground-secondary"
    >
      <span class="i-lucide-presentation text-2xl" aria-hidden="true" />
    </span>
    <h2 class="m-0 text-base font-semibold">No decks found</h2>
    <p class="m-0 max-w-md text-sm text-foreground-secondary">
      Add a folder with a
      <code class="rounded bg-tertiary px-1 py-px">slides.md</code>
      that matches a pattern in
      <code class="rounded bg-tertiary px-1 py-px">slidevision.json</code>, then
      open the project again.
    </p>
  </section>
  <template v-else>
    <div class="mb-5 flex items-center gap-2.5">
      <h2 class="m-0 text-xl font-semibold tracking-tight">Decks</h2>
      <span
        class="rounded-full bg-tertiary px-2 py-px text-xs font-semibold text-foreground-secondary"
      >
        {{ decks.length }}
      </span>
    </div>
    <ul class="m-0 grid list-none grid-cols-3 gap-6 p-0">
      <li v-for="deck in decks" :key="deck.id">
        <DeckCard :deck="deck" @open="$emit('open', deck)" />
      </li>
    </ul>
  </template>
</template>
