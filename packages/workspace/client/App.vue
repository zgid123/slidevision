<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { fetchDecks } from './api';
import DeckList from './components/DeckList.vue';
import type { IDeckSummary } from './shared';

const decks = ref<IDeckSummary[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

onMounted(async () => {
  try {
    decks.value = await fetchDecks();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <main class="min-h-screen bg-secondary text-foreground-primary">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="mb-8">
        <h1 class="text-2xl font-semibold">Slidevision</h1>
        <p class="text-sm text-foreground-secondary">Your Slidev decks</p>
      </header>
      <p v-if="isLoading" class="text-foreground-secondary">Loading decks…</p>
      <p v-else-if="loadError" role="alert">
        Could not load the decks: {{ loadError }}
      </p>
      <DeckList v-else :decks="decks" />
    </div>
  </main>
</template>
