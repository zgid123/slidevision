<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { fetchDecks, requestOpenDeck } from './api';
import DeckList from './components/DeckList.vue';
import { deckStatus, deckStatusEvent, type IDeckSummary } from './shared';

const decks = ref<IDeckSummary[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

function updateDeck(summary: IDeckSummary): void {
  decks.value = decks.value.map((deck) => {
    return deck.id === summary.id ? summary : deck;
  });
}

function reserveTab(name: string): Window | null {
  const tab = window.open('', '_blank');

  if (tab) {
    tab.opener = null;
    tab.document.title = `Starting ${name}`;
    tab.document.body.textContent = `Starting ${name}…`;
  }

  return tab;
}

async function openDeck(deck: IDeckSummary): Promise<void> {
  if (deck.status === deckStatus.running && deck.url) {
    window.open(deck.url, '_blank', 'noopener');

    return;
  }

  const tab = reserveTab(deck.name);

  try {
    const summary = await requestOpenDeck(deck.id);

    updateDeck(summary);

    if (summary.status !== deckStatus.running || !summary.url) {
      tab?.close();

      return;
    }

    if (tab) {
      tab.location.href = summary.url;
    } else {
      window.open(summary.url, '_blank', 'noopener');
    }
  } catch (error) {
    tab?.close();
    updateDeck({
      ...deck,
      status: deckStatus.failed,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

import.meta.hot?.on(deckStatusEvent, (summary: IDeckSummary) => {
  updateDeck(summary);
});

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
      <DeckList v-else :decks="decks" @open="openDeck" />
    </div>
  </main>
</template>
