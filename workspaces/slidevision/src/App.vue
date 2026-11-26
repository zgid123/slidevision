<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';

import DeckList from '#/features/decks/components/DeckList.vue';
import CardGridSkeleton from '#/features/decks/components/CardGridSkeleton.vue';
import DeckScreen from '#/features/decks/components/DeckScreen.vue';
import WelcomeScreen from '#/features/projects/components/WelcomeScreen.vue';
import ThemeSwitch from '#/features/window/components/ThemeSwitch.vue';
import WindowControls from '#/features/window/components/WindowControls.vue';
import { projectKind } from '@contracts/project';
import { projectsApi } from '#/features/projects/api';
import {
  screenName,
  useProjectSession,
} from '#/features/projects/hooks/useProjectSession';
import { windowApi } from '#/features/window/api';
import { useTheme } from '#/features/window/hooks/useTheme';

const session = useProjectSession({
  api: projectsApi,
});

const theme = useTheme({
  api: windowApi,
  storage: localStorage,
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
  void theme.restore();
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
  <main
    class="h-screen overflow-hidden bg-secondary font-sans text-foreground-primary antialiased"
  >
    <div
      v-if="session.screen.name === screenName.welcome"
      class="relative h-full"
    >
      <WelcomeScreen
        :recent="session.recent"
        :error="session.error"
        @open-folder="session.openFolder()"
        @open="(path) => session.open({ path })"
        @remove="(path) => session.removeRecent({ path })"
      />
      <div
        class="absolute inset-x-0 top-0 flex h-11 items-center justify-between px-4"
        data-tauri-drag-region
      >
        <WindowControls />
        <ThemeSwitch
          :preference="theme.preference"
          @choose="(preference) => theme.choose({ preference })"
        />
      </div>
    </div>
    <div v-else class="flex h-full flex-col">
      <header
        class="flex min-h-13 shrink-0 items-center gap-3 border-b border-stroke-primary bg-primary py-2 pr-4 pl-4"
        data-tauri-drag-region
      >
        <WindowControls class="mr-3" />
        <span
          class="i-lucide-folder text-lg text-indigo-700 dark:text-indigo-300"
          aria-hidden="true"
          data-tauri-drag-region
        />
        <h1 class="m-0 shrink-0 text-sm font-semibold" data-tauri-drag-region>
          {{ projectName }}
        </h1>
        <p
          class="m-0 min-w-0 flex-1 truncate text-xs text-foreground-secondary"
          :title="root"
          data-tauri-drag-region
        >
          {{ root }}
        </p>
        <ThemeSwitch
          :preference="theme.preference"
          @choose="(preference) => theme.choose({ preference })"
        />
        <button
          v-if="session.screen.name !== screenName.opening"
          type="button"
          class="btn-ghost"
          @click="session.close()"
        >
          <span class="i-lucide-x text-base" aria-hidden="true" />
          Close Project
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto px-10 pt-7 pb-10">
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
