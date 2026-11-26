<script setup lang="ts">
import type { IDeck } from '@contracts/project';
import { computed, onMounted, onUnmounted, ref } from 'vue';

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
const selectedSlide = computed(() => {
  const { view } = deckSlides;

  return view.state === slidesState.ready ? view.selected : 1;
});
const playLabel = computed(() => {
  return selectedSlide.value > 1 ? `Play from ${selectedSlide.value}` : 'Play';
});
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
    <div class="mb-5 flex shrink-0 items-center gap-3">
      <button
        v-if="canGoBack"
        type="button"
        class="btn-ghost -ml-3"
        @click="$emit('back')"
      >
        <span class="i-lucide-chevron-left text-base" aria-hidden="true" />
        All decks
      </button>
      <h2
        class="m-0 min-w-0 flex-1 truncate text-xl font-semibold tracking-tight"
      >
        {{ deck.name }}
      </h2>
      <button
        type="button"
        class="btn-primary"
        :disabled="deckSlides.view.state !== slidesState.ready || isPresenting"
        @click="play"
      >
        <span class="i-lucide-play text-sm" aria-hidden="true" />
        {{ playLabel }}
      </button>
    </div>
    <p
      v-if="playError"
      role="alert"
      class="mt-0 mb-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
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
      <section
        v-else-if="isPresenting"
        class="flex h-full flex-col items-center justify-center gap-3 pb-16 text-center"
        data-presenting
      >
        <span
          class="flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
        >
          <span class="i-lucide-presentation text-3xl" aria-hidden="true" />
        </span>
        <h3 class="mt-1 mb-0 text-lg font-semibold">
          Presenting from slide {{ selectedSlide }}
        </h3>
        <p class="m-0 max-w-md text-sm text-foreground-secondary">
          The slides come back here when the presentation ends.
        </p>
      </section>
      <template v-else>
        <CardGridSkeleton
          v-if="!isOverviewLoaded"
          :label="`Starting ${deck.name}`"
          class="absolute inset-0 overflow-hidden"
        />
        <iframe
          v-if="deckSlides.view.state === slidesState.ready"
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
