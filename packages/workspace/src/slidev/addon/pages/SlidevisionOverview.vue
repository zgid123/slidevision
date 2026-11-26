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
  --slidevision-neutral-50: oklch(98.5% 0 0);
  --slidevision-neutral-100: oklch(97% 0 0);
  --slidevision-neutral-200: oklch(92.2% 0 0);
  --slidevision-neutral-400: oklch(70.8% 0 0);
  --slidevision-neutral-600: oklch(43.9% 0 0);
  --slidevision-neutral-800: oklch(26.9% 0 0);
  --slidevision-neutral-950: oklch(14.5% 0 0);
  --slidevision-indigo-100: oklch(93% 0.034 272.788);
  --slidevision-indigo-600: oklch(51.1% 0.262 276.966);
  --slidevision-indigo-900: oklch(35.9% 0.144 278.697);
  --slidevision-white: oklch(100% 0 0);

  --slidevision-background: var(--slidevision-neutral-100);
  --slidevision-stroke: var(--slidevision-neutral-200);
  --slidevision-stroke-hover: var(--slidevision-neutral-400);
  --slidevision-badge: var(--slidevision-neutral-200);
  --slidevision-foreground: var(--slidevision-neutral-950);
  --slidevision-foreground-muted: var(--slidevision-neutral-600);
  --slidevision-accent: var(--slidevision-indigo-600);
  --slidevision-accent-soft: var(--slidevision-indigo-100);
  --slidevision-on-accent: var(--slidevision-white);

  position: fixed;
  inset: 0;
  overflow-y: auto;
  scrollbar-width: none;
  background: var(--slidevision-background);
}

.slidevision-overview::-webkit-scrollbar {
  display: none;
}

@media (prefers-color-scheme: dark) {
  .slidevision-overview {
    --slidevision-background: var(--slidevision-neutral-950);
    --slidevision-stroke: var(--slidevision-neutral-800);
    --slidevision-stroke-hover: var(--slidevision-neutral-600);
    --slidevision-badge: var(--slidevision-neutral-800);
    --slidevision-foreground: var(--slidevision-neutral-50);
    --slidevision-foreground-muted: var(--slidevision-neutral-400);
    --slidevision-accent-soft: var(--slidevision-indigo-900);
  }
}

.slidevision-grid {
  display: grid;
  gap: 1.5rem;
  margin: 0;
  padding: 0.375rem;
  list-style: none;
}

.slidevision-card {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 0.625rem;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.slidevision-card:focus-visible {
  outline: 2px solid var(--slidevision-accent);
  outline-offset: 6px;
}

.slidevision-card__slide {
  overflow: hidden;
  border-radius: 0.625rem;
  box-shadow: 0 0 0 1px var(--slidevision-stroke);
  pointer-events: none;
}

.slidevision-card--selected .slidevision-card__slide {
  box-shadow:
    0 0 0 2px var(--slidevision-accent),
    0 0 0 5px var(--slidevision-accent-soft);
}

.slidevision-card:not(.slidevision-card--selected):hover
  .slidevision-card__slide {
  box-shadow: 0 0 0 1px var(--slidevision-stroke-hover);
}

.slidevision-card__caption {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.125rem 0;
  color: var(--slidevision-foreground-muted);
  font-family:
    -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
}

.slidevision-card__no {
  flex: none;
  min-width: 1.375rem;
  box-sizing: border-box;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  background: var(--slidevision-badge);
  font-size: 0.6875rem;
  font-weight: 650;
  text-align: center;
}

.slidevision-card--selected .slidevision-card__caption {
  color: var(--slidevision-foreground);
}

.slidevision-card--selected .slidevision-card__no {
  background: var(--slidevision-accent);
  color: var(--slidevision-on-accent);
}

.slidevision-card__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
