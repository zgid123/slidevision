<script setup lang="ts">
import type { IDeck } from '@contracts/project';
import { onMounted, onUnmounted, ref } from 'vue';

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

const retry = (): void => {
  isOverviewLoaded.value = false;
  void deckSlides.start();
};

onMounted(() => {
  window.addEventListener('message', onMessage);
  void deckSlides.start();
});

onUnmounted(() => {
  window.removeEventListener('message', onMessage);
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
        class="shrink-0 rounded-md bg-foreground-primary px-4 py-1.5 text-sm font-medium text-primary disabled:opacity-40"
        title="Playing on your displays comes in the next update."
        disabled
      >
        ▶ Play
      </button>
    </div>
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
