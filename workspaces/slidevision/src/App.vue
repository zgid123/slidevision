<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';

import DeckList from '#/features/decks/components/DeckList.vue';
import CardGridSkeleton from '#/features/decks/components/CardGridSkeleton.vue';
import DeckScreen from '#/features/decks/components/DeckScreen.vue';
import WelcomeScreen from '#/features/projects/components/WelcomeScreen.vue';
import { projectKind } from '@contracts/project';
import { projectsApi } from '#/features/projects/api';
import {
  screenName,
  useProjectSession,
} from '#/features/projects/hooks/useProjectSession';

const session = useProjectSession({
  api: projectsApi,
});

let stopListening: (() => void) | undefined;

const project = computed(() => {
  const { screen } = session;

  return screen.name === screenName.decks || screen.name === screenName.deck
    ? screen.project
    : null;
});

const root = computed(() => {
  const { screen } = session;

  return screen.name === screenName.opening
    ? screen.path
    : (project.value?.root ?? '');
});

const projectName = computed(() => {
  return root.value.split(/[\\/]/).filter(Boolean).at(-1) ?? '';
});

onMounted(async () => {
  stopListening = await projectsApi.onOpenFolderRequested(() => {
    void session.openFolder();
  });

  await session.load();
});

onUnmounted(() => {
  stopListening?.();
});
</script>

<template>
  <main class="min-h-screen bg-secondary text-foreground-primary">
    <WelcomeScreen
      v-if="session.screen.name === screenName.welcome"
      :recent="session.recent"
      :error="session.error"
      @open-folder="session.openFolder()"
      @open="(path) => session.open({ path })"
      @remove="(path) => session.removeRecent({ path })"
    />
    <div v-else class="flex h-screen flex-col p-10">
      <header class="mb-8 flex shrink-0 items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold">{{ projectName }}</h1>
          <p class="truncate text-sm text-foreground-secondary" :title="root">
            {{ root }}
          </p>
        </div>
        <button
          v-if="session.screen.name !== screenName.opening"
          type="button"
          class="shrink-0 rounded-md border border-stroke-secondary px-3 py-1.5 text-sm hover:bg-tertiary"
          @click="session.close()"
        >
          Close Project
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <CardGridSkeleton
          v-if="session.screen.name === screenName.opening"
          :label="`Opening ${root}`"
        />
        <DeckList
          v-else-if="session.screen.name === screenName.decks"
          :decks="session.screen.project.decks"
          @open="(deck) => session.openDeck({ deck })"
        />
        <DeckScreen
          v-else-if="session.screen.name === screenName.deck"
          :key="session.screen.deck.id"
          :deck="session.screen.deck"
          :can-go-back="session.screen.project.kind === projectKind.workspace"
          @back="session.back()"
        />
      </div>
    </div>
  </main>
</template>
