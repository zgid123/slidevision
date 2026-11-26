<script setup lang="ts">
import type { IDeck } from '@contracts/project';
import { onMounted, onUnmounted, ref } from 'vue';

import { presentationApi } from '#/features/presentation/api';

import { decksApi } from '../api';
import { slidesState, useDeckSlides } from '../hooks/useDeckSlides';
import { overviewSrc, readSelectedSlide } from '../utils/overview';
import CardGridSkeleton from './CardGridSkeleton.vue';
import DeckFailure from './DeckFailure.vue';

const props = defineProps<{
  deck: IDeck;
  canGoBack: boolean;
}>();

defineEmits<{
  back: [];
}>();

const deckSlides = useDeckSlides({
  api: decksApi,
  deck: props.deck,
});
const isOverviewLoaded = ref(false);
const playError = ref<string | null>(null);
const isPresenting = ref(false);
let stopWatchingPresentation: (() => void) | undefined;
let isUnmounted = false;

const onMessage = (event: MessageEvent): void => {
  const { view } = deckSlides;

  if (view.state !== slidesState.ready) {
    return;
  }

  const no = readSelectedSlide({
    url: view.url,
    event,
  });

  if (no !== null) {
    deckSlides.select({
      no,
    });
  }
};

const play = async (): Promise<void> => {
  const { view } = deckSlides;

  if (view.state !== slidesState.ready) {
    return;
  }

  playError.value = null;

  try {
    await presentationApi.play({
      url: view.url,
      slide: view.selected,
    });
  } catch (error) {
    playError.value = error instanceof Error ? error.message : String(error);
  }
};

const retry = (): void => {
  isOverviewLoaded.value = false;
  void deckSlides.start();
};

const onPresentationChanged = (presenting: boolean): void => {
  isPresenting.value = presenting;

  if (presenting) {
    isOverviewLoaded.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('message', onMessage);
  void deckSlides.start();
  stopWatchingPresentation = await presentationApi.onPresentationChanged(
    onPresentationChanged,
  );

  if (isUnmounted) {
    stopWatchingPresentation();
  }
});

onUnmounted(() => {
  isUnmounted = true;
  window.removeEventListener('message', onMessage);
  stopWatchingPresentation?.();
  deckSlides.stop();
});
</script>

<template>
  <section class="flex h-full flex-col">
    <div class="mb-6 flex shrink-0 items-center gap-4">
      <button
        v-if="canGoBack"
        type="button"
        class="shrink-0 rounded-md border border-stroke-secondary px-3 py-1.5 text-sm hover:bg-tertiary"
        @click="$emit('back')"
      >
        ← All decks
      </button>
      <h2 class="m-0 min-w-0 flex-1 truncate text-xl font-semibold">
        {{ deck.name }}
      </h2>
      <button
        type="button"
        class="shrink-0 rounded-md bg-foreground-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-foreground-secondary disabled:opacity-40"
        :disabled="deckSlides.view.state !== slidesState.ready"
        @click="play"
      >
        ▶ Play
      </button>
    </div>
    <p
      v-if="playError"
      role="alert"
      class="mt-0 mb-4 shrink-0 text-sm text-foreground-secondary"
    >
      {{ playError }}
    </p>
    <div class="relative min-h-0 flex-1">
      <DeckFailure
        v-if="deckSlides.view.state === slidesState.failed"
        :deck-name="deck.name"
        :error="deckSlides.view.error"
        @retry="retry"
      />
      <template v-else>
        <CardGridSkeleton
          v-if="!isOverviewLoaded"
          :label="`Starting ${deck.name}`"
          class="absolute inset-0 overflow-hidden"
        />
        <iframe
          v-if="deckSlides.view.state === slidesState.ready && !isPresenting"
          :src="overviewSrc({ url: deckSlides.view.url })"
          :title="`Slides of ${deck.name}`"
          :data-selected-slide="deckSlides.view.selected"
          class="h-full w-full border-0"
          :class="{ invisible: !isOverviewLoaded }"
          @load="isOverviewLoaded = true"
        />
      </template>
    </div>
  </section>
</template>
