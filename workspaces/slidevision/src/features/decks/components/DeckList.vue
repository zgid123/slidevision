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
    class="rounded-lg border border-dashed border-stroke-secondary bg-primary p-10 text-center"
  >
    <h2 class="text-lg font-medium">No decks found</h2>
    <p class="mt-2 text-sm text-foreground-secondary">
      Add a folder with a <code>slides.md</code> that matches a pattern in
      <code>slidevision.json</code>, then open the project again.
    </p>
  </section>
  <ul v-else class="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="deck in decks" :key="deck.id">
      <DeckCard :deck="deck" @open="$emit('open', deck)" />
    </li>
  </ul>
</template>
