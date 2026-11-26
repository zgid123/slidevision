<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import { computed } from 'vue';

import type { TArchitecture, TReleases } from '../releases';
import PresentationDemo from './PresentationDemo.vue';

interface IPlatform {
  readonly id: 'darwin' | 'windows';
  readonly name: string;
  readonly hasChips: boolean;
  readonly arches: readonly TArchitecture[];
}

interface IFeature {
  readonly title: string;
  readonly text: string;
}

const PLATFORMS: readonly IPlatform[] = [
  {
    id: 'darwin',
    name: 'macOS',
    hasChips: true,
    arches: ['aarch64', 'x86_64'],
  },
  {
    id: 'windows',
    name: 'Windows',
    hasChips: false,
    arches: ['x86_64'],
  },
];

const CHIPS: Record<TArchitecture, string> = {
  aarch64: 'Apple silicon',
  // biome-ignore lint/style/useNamingConvention: Tauri architecture name.
  x86_64: 'Intel Mac',
};

const FEATURES: readonly IFeature[] = [
  {
    title: 'Two-screen presenting',
    text: 'Click Play on any slide to put the fullscreen deck on your projector while keeping speaker notes and the next slide on your laptop.',
  },
  {
    title: 'Single decks and workspaces',
    text: 'Open any folder with slides.md directly, or organize an entire repository of talks with a single slidevision.json.',
  },
  {
    title: 'Visual slide overview',
    text: 'Browse every slide rendered cleanly in a grid, jump straight to any slide number, and press Esc when your talk finishes.',
  },
  {
    title: 'Light, dark, and system themes',
    text: 'Matches macOS and Windows appearance automatically or switches between light and dark modes with a single click.',
  },
  {
    title: 'Signed automatic updates',
    text: 'Checks for new releases on startup and installs cryptographically verified updates directly inside the app.',
  },
  {
    title: 'Browser landing CLI',
    text: 'Prefer the browser? Run @slidevision/workspace to browse decks from a local web page without leaving your editor.',
  },
];

const { frontmatter } = useData();

const releases = computed<TReleases>(() => {
  return frontmatter.value.releases ?? {};
});

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function labelFor(platform: IPlatform, arch: TArchitecture): string {
  return platform.hasChips ? CHIPS[arch] : platform.name;
}
</script>

<template>
  <div class="landing">
    <section class="hero">
      <img
        class="icon"
        :src="withBase('/icon.png')"
        alt="Slidevision app icon"
        width="168"
        height="168"
      >
      <h1>Slidevision</h1>
      <p class="pitch">Present Slidev decks on two screens.</p>
      <p class="lead">
        Open a Slidev workspace or single deck on macOS and Windows with
        two-screen presenting, or run the
        <code>@slidevision/workspace</code>
        CLI to browse every deck in your repository from a local browser landing
        page.
      </p>

      <div id="download" class="downloads">
        <template v-for="platform in PLATFORMS" :key="platform.id">
          <a
            v-for="download in releases[platform.id]?.downloads ?? []"
            :key="download.arch"
            class="download"
            :href="download.url"
          >
            <svg
              v-if="platform.id === 'darwin'"
              class="logo"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M16.37 12.6c-.02-2.33 1.9-3.45 1.99-3.5-1.08-1.59-2.77-1.8-3.37-1.83-1.43-.15-2.8.84-3.53.84-.73 0-1.85-.82-3.04-.8-1.56.02-3.01.91-3.81 2.31-1.63 2.82-.42 6.99 1.17 9.28.78 1.12 1.7 2.38 2.9 2.33 1.17-.05 1.61-.75 3.02-.75 1.41 0 1.81.75 3.04.73 1.26-.02 2.05-1.14 2.82-2.27.89-1.3 1.25-2.56 1.27-2.63-.03-.01-2.44-.93-2.46-3.71ZM14.06 5.75c.64-.78 1.08-1.86.96-2.94-.93.04-2.05.62-2.71 1.39-.6.69-1.12 1.79-.98 2.85 1.04.08 2.09-.53 2.73-1.3Z"
              />
            </svg>
            <svg v-else class="logo" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3 5.1 10.4 4v7.2H3V5.1Zm8.4-1.24L21 2.5v8.7h-9.6V3.86ZM3 12.8h7.4V20L3 18.9v-6.1Zm8.4 0H21v8.7l-9.6-1.36V12.8Z"
              />
            </svg>
            <span class="label">
              <span class="name"
                >Download for {{ labelFor(platform, download.arch) }}</span
              >
              <span class="meta">
                Version {{ releases[platform.id]?.version
                }}<template v-if="releases[platform.id]?.date">
                  ·
                  {{ formatDate(releases[platform.id]?.date ?? '') }}</template
                >
              </span>
            </span>
          </a>
          <template v-if="!releases[platform.id]">
            <div
              v-for="arch in platform.arches"
              :key="arch"
              class="download soon"
            >
              <span class="label">
                <span class="name">{{ labelFor(platform, arch) }}</span>
                <span class="meta">Coming soon</span>
              </span>
            </div>
          </template>
        </template>
      </div>
      <p class="requirements">
        <span>macOS 11+ (Apple silicon &amp; Intel)</span>
        <span>Windows 10 / 11 (x64)</span>
        <span>Node.js 22.22+</span>
      </p>
      <p class="install-link">
        First time?
        <a :href="withBase('/install')">See how to install &amp; use it</a>
        ·
        <a :href="withBase('/workspace')">Use the @slidevision/workspace CLI</a
        >.
      </p>
    </section>

    <section class="demo-section">
      <PresentationDemo />
    </section>

    <section class="workspace-section" aria-labelledby="workspace-heading">
      <div class="workspace-copy">
        <span class="workspace-eyebrow"
          >npm package · @slidevision/workspace</span
        >
        <h2 id="workspace-heading">One workspace for all your Slidev decks</h2>
        <p class="workspace-desc">
          Add <code>@slidevision/workspace</code> to any repository with
          <code>@slidev/cli</code>
          installed. It reads
          <code>slidevision.json</code>, builds deck cards from each deck's
          <code>slides.md</code>
          headmatter (<code>title</code>
          and
          <code>background</code>), starts individual Slidev servers on demand
          from port 3030, and powers the desktop app's workspace mode too.
        </p>

        <div class="workspace-snippets">
          <pre class="snippet"><code>pnpm add -D @slidevision/workspace
pnpm slidevision</code></pre>
          <pre class="snippet"><code>// slidevision.json
{
  "decks": ["decks/*"]
}</code></pre>
        </div>

        <div class="workspace-links">
          <a class="cta-secondary" :href="withBase('/workspace')"
            >Read the Workspace CLI guide</a
          >
          <a
            class="npm-link"
            href="https://www.npmjs.com/package/@slidevision/workspace"
            target="_blank"
            rel="noopener"
            >View on npm →</a
          >
        </div>
      </div>

      <div class="workspace-preview" aria-hidden="true">
        <div class="browser-chrome">
          <span class="browser-dots">
            <i />
            <i />
            <i />
          </span>
          <span class="browser-url">http://localhost:3000/</span>
        </div>
        <div class="browser-body">
          <div class="browser-card active">
            <div class="card-info">
              <strong>Distributed Systems 101</strong>
              <span>decks/distributed-systems · :3030</span>
            </div>
            <span class="card-status running">Running</span>
          </div>
          <div class="browser-card">
            <div class="card-info">
              <strong>TypeScript Patterns</strong>
              <span>decks/typescript-patterns</span>
            </div>
            <span class="card-status">Open</span>
          </div>
          <div class="browser-card">
            <div class="card-info">
              <strong>Design Tokens</strong>
              <span>decks/design-tokens</span>
            </div>
            <span class="card-status">Open</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Built for Slidev talks</h2>
      <div class="grid">
        <article
          v-for="feature in FEATURES"
          :key="feature.title"
          class="feature"
        >
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </section>

    <section class="closing">
      <img :src="withBase('/icon.png')" alt="" width="72" height="72">
      <h2>Present on two screens or in your browser.</h2>
      <div class="closing-actions">
        <a class="cta" href="#download">Download Desktop App</a>
        <a class="cta-secondary" :href="withBase('/workspace')"
          >Workspace CLI Guide</a
        >
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  overflow: hidden;
  padding: 0 24px 96px;
}

.landing::before {
  content: '';
  position: absolute;
  inset: -200px 0 auto;
  height: 720px;
  background:
    radial-gradient(
      ellipse 60% 50% at 50% 40%,
      var(--sv-indigo-glow),
      transparent 70%
    ),
    radial-gradient(
      ellipse 34% 26% at 50% 62%,
      var(--sv-coral-glow),
      transparent 70%
    );
  pointer-events: none;
}

section {
  position: relative;
  max-width: 1040px;
  margin: 0 auto;
}

.hero {
  padding-top: 72px;
  text-align: center;
}

.icon {
  display: block;
  margin: 0 auto 24px;
  filter: drop-shadow(0 24px 48px var(--sv-indigo-shadow));
}

h1 {
  margin: 0;
  font-size: clamp(44px, 8vw, 64px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--sv-heading);
}

.pitch {
  margin: 14px 0 0;
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
  background: linear-gradient(90deg, var(--sv-accent-cyan), var(--sv-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lead {
  max-width: 580px;
  margin: 16px auto 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--sv-muted);
}

.downloads {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 36px;
  scroll-margin-top: 96px;
}

.download {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 260px;
  padding: 14px 22px;
  border-radius: 14px;
  background: var(--sv-accent-cyan);
  color: var(--sv-accent-text);
  text-align: left;
  text-decoration: none;
  box-shadow: 0 12px 32px -12px var(--sv-accent-glow);
}

@media (prefers-reduced-motion: no-preference) {
  .download {
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  .download:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px -12px var(--sv-accent-glow);
  }
}

.download:focus-visible,
.cta:focus-visible,
.cta-secondary:focus-visible {
  outline: 2px solid var(--demo-focus);
  outline-offset: 2px;
}

.download.soon {
  justify-content: center;
  background: var(--sv-surface);
  border: 1px solid var(--sv-border);
  color: var(--sv-muted);
  box-shadow: none;
  text-align: center;
}

.logo {
  width: 26px;
  height: 26px;
  flex: none;
}

.label {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 16px;
  font-weight: 650;
}

.meta {
  font-size: 13px;
  opacity: 0.75;
}

.requirements {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 22px;
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--sv-muted);
}

.install-link {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--sv-muted);
}

.install-link a {
  color: var(--sv-accent-cyan);
  font-weight: 500;
}

.demo-section {
  margin-top: 72px;
}

h2 {
  margin: 0 0 32px;
  border: none;
  padding: 0;
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  color: var(--sv-heading);
}

.workspace-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: 32px;
  margin-top: 104px;
}

@media (min-width: 860px) {
  .workspace-section {
    grid-template-columns: 1.15fr 1fr;
  }
}

.workspace-eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--demo-badge-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--demo-badge-text);
}

.workspace-copy h2 {
  margin-bottom: 14px;
  text-align: left;
}

.workspace-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--sv-muted);
}

.workspace-desc code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--sv-surface);
  font-size: 13px;
  color: var(--sv-heading);
}

.workspace-snippets {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  margin-top: 20px;
}

@media (min-width: 540px) {
  .workspace-snippets {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.snippet {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  border: 1px solid var(--sv-border);
  border-radius: 12px;
  background: var(--demo-slide-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--sv-heading);
}

.workspace-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 22px;
}

.npm-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--sv-accent-cyan);
  text-decoration: none;
}

.npm-link:focus-visible {
  outline: 2px solid var(--demo-focus);
  outline-offset: 2px;
}

.workspace-preview {
  overflow: hidden;
  border: 1px solid var(--demo-frame-border);
  border-radius: 16px;
  background: var(--demo-slide-bg);
}

.browser-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--demo-frame-border);
  background: var(--demo-frame);
}

.browser-dots {
  display: inline-flex;
  gap: 5px;
}

.browser-dots i {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--demo-dot);
}

.browser-url {
  flex: 1;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--demo-slide-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--demo-slide-muted);
}

.browser-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.browser-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--demo-frame-border);
  border-radius: 10px;
  background: var(--demo-slide-card);
}

.browser-card.active {
  border-color: var(--sv-accent-glow);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-info strong {
  font-size: 13px;
  color: var(--demo-slide-text);
}

.card-info span {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--demo-slide-muted);
}

.card-status {
  padding: 4px 10px;
  border: 1px solid var(--demo-frame-border);
  border-radius: 8px;
  background: var(--demo-frame);
  font-size: 12px;
  font-weight: 600;
  color: var(--demo-slide-text);
}

.card-status.running {
  border-color: transparent;
  background: var(--demo-badge-bg);
  color: var(--demo-badge-text);
}

.features {
  margin-top: 104px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.feature {
  padding: 24px;
  border: 1px solid var(--sv-border);
  border-radius: 16px;
  background: var(--sv-surface);
}

@media (prefers-reduced-motion: no-preference) {
  .feature {
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .feature:hover {
    border-color: var(--sv-accent-glow);
    transform: translateY(-2px);
  }
}

.feature h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 650;
  color: var(--sv-heading);
}

.feature p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--sv-muted);
}

.closing {
  margin-top: 104px;
  text-align: center;
}

.closing img {
  display: block;
  margin: 0 auto 18px;
}

.closing h2 {
  margin-bottom: 22px;
}

.closing-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.cta {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 999px;
  background: var(--sv-accent-cyan);
  color: var(--sv-accent-text);
  font-weight: 650;
  text-decoration: none;
}

.cta-secondary {
  display: inline-block;
  padding: 12px 28px;
  border: 1px solid var(--sv-border);
  border-radius: 999px;
  background: var(--sv-surface);
  color: var(--sv-heading);
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 640px) {
  .hero {
    padding-top: 40px;
  }

  .download {
    width: 100%;
    min-width: 0;
  }
}
</style>
