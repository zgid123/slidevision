<script setup lang="ts">
import { computed, ref } from 'vue';

interface ISlide {
  readonly number: number;
  readonly title: string;
  readonly subtitle: string;
  readonly code: string;
  readonly notes: string;
}

const FIRST_SLIDE: ISlide = {
  number: 1,
  title: 'Distributed Systems 101',
  subtitle: 'Consensus without a single point of failure',
  code: 'slides.md · Slide 1 of 3',
  notes:
    'Open with the network partition story before introducing Raft leader election.',
};

const SLIDES: readonly ISlide[] = [
  FIRST_SLIDE,
  {
    number: 2,
    title: 'Leader Election',
    subtitle: 'Randomized timeouts prevent split votes',
    code: 'electionTimeoutMs: 150..300',
    notes:
      'Remind the audience why symmetric timers cause repeated split-brain rounds.',
  },
  {
    number: 3,
    title: 'Log Replication',
    subtitle: 'Committed once a majority acknowledges',
    code: 'commitIndex = majority(matchIndex)',
    notes:
      'Point to the quorum highlight on the projector, then take questions.',
  },
];

const index = ref(0);

const current = computed<ISlide>(() => {
  return SLIDES[index.value] ?? FIRST_SLIDE;
});

const next = computed(() => {
  return SLIDES[index.value + 1] ?? null;
});

function previousSlide(): void {
  if (index.value > 0) {
    index.value -= 1;
  }
}

function nextSlide(): void {
  if (index.value < SLIDES.length - 1) {
    index.value += 1;
  }
}
</script>

<template>
  <section class="demo-shell" aria-label="Dual-screen presentation preview">
    <div class="demo-screens">
      <div class="screen projector">
        <div class="chrome">
          <span class="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span class="caption">Projector · Slides</span>
          <span class="badge">Fullscreen</span>
        </div>
        <div class="slide-canvas">
          <span class="slide-tag">{{ current.code }}</span>
          <h3>{{ current.title }}</h3>
          <p>{{ current.subtitle }}</p>
        </div>
      </div>

      <div class="screen presenter">
        <div class="chrome">
          <span class="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span class="caption">Laptop · Presenter View</span>
          <span class="counter"
            >{{ current.number }}
            / {{ SLIDES.length }}</span
          >
        </div>
        <div class="presenter-grid">
          <div class="preview-col">
            <div class="mini-label">Current</div>
            <div class="mini-slide">
              <strong>{{ current.title }}</strong>
              <span>{{ current.subtitle }}</span>
            </div>
            <div class="mini-label">Next</div>
            <div class="mini-slide next">
              <template v-if="next">
                <strong>{{ next.title }}</strong>
                <span>{{ next.subtitle }}</span>
              </template>
              <span v-else>End of deck</span>
            </div>
          </div>
          <div class="notes-col">
            <div class="mini-label">Speaker Notes</div>
            <p class="notes-text">{{ current.notes }}</p>
            <div class="controls">
              <button
                type="button"
                class="nav-btn"
                :disabled="index === 0"
                @click="previousSlide"
              >
                Previous
              </button>
              <button
                type="button"
                class="nav-btn primary"
                :disabled="index === SLIDES.length - 1"
                @click="nextSlide"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-shell {
  padding: 20px;
  border: 1px solid var(--demo-frame-border);
  border-radius: 20px;
  background: var(--demo-frame);
}

.demo-screens {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

@media (min-width: 860px) {
  .demo-screens {
    grid-template-columns: 1.15fr 1fr;
  }
}

.screen {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--demo-frame-border);
  border-radius: 14px;
  background: var(--demo-slide-bg);
}

.chrome {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--demo-frame-border);
  background: var(--demo-frame);
}

.dots {
  display: inline-flex;
  gap: 5px;
}

.dots i {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--demo-dot);
}

.caption {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--demo-slide-muted);
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--demo-badge-bg);
  font-size: 11px;
  font-weight: 600;
  color: var(--demo-badge-text);
}

.counter {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--demo-slide-muted);
}

.slide-canvas {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-height: 220px;
  padding: 28px;
  text-align: left;
}

.slide-tag {
  align-self: flex-start;
  margin-bottom: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--demo-slide-card);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--demo-badge-text);
}

.slide-canvas h3 {
  margin: 0;
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--demo-slide-text);
}

.slide-canvas p {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--demo-slide-muted);
}

.presenter-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1.15fr;
  gap: 12px;
  padding: 14px;
  background: var(--demo-notes-bg);
}

.preview-col,
.notes-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--demo-slide-muted);
}

.mini-slide {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border: 1px solid var(--demo-frame-border);
  border-radius: 8px;
  background: var(--demo-slide-card);
  text-align: left;
}

.mini-slide strong {
  font-size: 12px;
  color: var(--demo-slide-text);
}

.mini-slide span {
  font-size: 11px;
  color: var(--demo-slide-muted);
}

.mini-slide.next {
  opacity: 0.78;
}

.notes-text {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--demo-slide-text);
  text-align: left;
}

.controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.nav-btn {
  padding: 6px 12px;
  border: 1px solid var(--demo-frame-border);
  border-radius: 8px;
  background: var(--demo-slide-card);
  font-size: 12px;
  font-weight: 600;
  color: var(--demo-slide-text);
  cursor: pointer;
}

.nav-btn.primary {
  border-color: transparent;
  background: var(--sv-accent-cyan);
  color: var(--sv-accent-text);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.nav-btn:focus-visible {
  outline: 2px solid var(--demo-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .nav-btn {
    transition: opacity 0.15s;
  }
}
</style>
