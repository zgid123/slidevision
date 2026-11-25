<script setup lang="ts">
import { createFixedClicks } from '@slidev/client/composables/useClicks.ts';
import { useNav } from '@slidev/client/composables/useNav.ts';
import { CLICKS_MAX } from '@slidev/client/constants.ts';
import SlideContainer from '@slidev/client/internals/SlideContainer.vue';
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue';
import type { ClicksContext, SlideRoute } from '@slidev/types';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const gap = 24;
const selectMessage = {
  source: 'slidevision',
  type: 'select',
} as const;

const { slides } = useNav();
const grid = ref<HTMLElement>();
const width = ref(0);
const selected = ref(1);
const clicksByRoute = new WeakMap<SlideRoute, ClicksContext>();
let resizeObserver: ResizeObserver | undefined;

const columns = computed(() => {
  if (width.value >= 1_100) {
    return 4;
  }

  return width.value >= 800 ? 3 : 2;
});
const cardWidth = computed(() => {
  return Math.max(0, (width.value - gap * (columns.value - 1)) / columns.value);
});

function clicksOf(route: SlideRoute): ClicksContext {
  let clicks = clicksByRoute.get(route);

  if (!clicks) {
    clicks = createFixedClicks(route, CLICKS_MAX);
    clicksByRoute.set(route, clicks);
  }

  return clicks;
}

function select(no: number): void {
  selected.value = no;
  window.parent.postMessage(
    {
      ...selectMessage,
      no,
    },
    '*',
  );
}

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    const measured = Math.floor(entry?.contentRect.width ?? 0);

    requestAnimationFrame(() => {
      width.value = measured;
    });
  });

  if (grid.value) {
    resizeObserver.observe(grid.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="slidevision-overview">
    <ul
      ref="grid"
      class="slidevision-grid"
      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
    >
      <li v-for="route in slides" :key="route.no">
        <button
          type="button"
          class="slidevision-card"
          :class="{ 'slidevision-card--selected': route.no === selected }"
          :aria-pressed="route.no === selected"
          :data-slide-no="route.no"
          @click="select(route.no)"
        >
          <SlideContainer
            v-if="cardWidth > 0"
            :width="cardWidth"
            class="slidevision-card__slide"
          >
            <SlideWrapper
              :clicks-context="clicksOf(route)"
              :route="route"
              render-context="overview"
            />
          </SlideContainer>
          <span class="slidevision-card__caption">
            <span class="slidevision-card__no">{{ route.no }}</span>
            <span class="slidevision-card__title">
              {{ route.meta.slide.title }}
            </span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.slidevision-overview {
  --slidevision-background: #f5f5f5;
  --slidevision-surface: #fafafa;
  --slidevision-stroke: #e5e5e5;
  --slidevision-stroke-hover: #a3a3a3;
  --slidevision-foreground: #0a0a0a;
  --slidevision-foreground-muted: #737373;

  position: fixed;
  inset: 0;
  overflow-y: auto;
  background: var(--slidevision-background);
}

.slidevision-grid {
  display: grid;
  gap: 1.5rem;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
}

.slidevision-card {
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border: 2px solid var(--slidevision-stroke);
  border-radius: 0.5rem;
  background: var(--slidevision-surface);
  text-align: left;
  cursor: pointer;
}

.slidevision-card:hover {
  border-color: var(--slidevision-stroke-hover);
}

.slidevision-card--selected,
.slidevision-card--selected:hover {
  border-color: var(--slidevision-foreground);
}

.slidevision-card__slide {
  pointer-events: none;
}

.slidevision-card__caption {
  display: flex;
  color: var(--slidevision-foreground);
  font-family: ui-sans-serif, system-ui, sans-serif;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.slidevision-card__no {
  color: var(--slidevision-foreground-muted);
}

.slidevision-card__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
