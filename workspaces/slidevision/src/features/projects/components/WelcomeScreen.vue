<script setup lang="ts">
import appIcon from '../../../../src-tauri/icons/128x128@2x.png';
import type { IRecentProject } from '../interface';
import { formatOpenedAt } from '../utils/formatOpenedAt';

defineProps<{
  recent: IRecentProject[];
  error: string | null;
}>();

defineEmits<{
  openFolder: [];
  open: [path: string];
  remove: [path: string];
}>();

const now = Date.now();

const openedAtLabel = (openedAt: number): string => {
  return formatOpenedAt({
    openedAt,
    now,
  });
};
</script>

<template>
  <div class="flex h-screen">
    <section
      class="flex w-96 shrink-0 flex-col gap-7 border-r border-stroke-primary bg-secondary px-11 py-14"
    >
      <div class="flex flex-col gap-3.5">
        <img :src="appIcon" alt="" class="-ml-1.5 size-20">
        <div>
          <h1 class="m-0 text-2xl font-semibold tracking-tight">Slidevision</h1>
          <p class="mt-1 mb-0 text-sm text-foreground-secondary">
            Present Slidev decks on two screens.
          </p>
        </div>
      </div>
      <div class="flex flex-col gap-2.5">
        <button
          type="button"
          class="btn-primary h-11 rounded-xl px-3.5"
          @click="$emit('openFolder')"
        >
          <span class="i-lucide-folder-open text-lg" aria-hidden="true" />
          <span class="flex-1 text-left">Open Folder…</span>
          <kbd class="font-sans text-xs font-medium opacity-85">⌘O</kbd>
        </button>
        <p class="m-0 text-xs leading-relaxed text-foreground-secondary">
          Choose a folder that has a
          <code class="rounded bg-tertiary px-1 py-px">slidevision.json</code>
          or a <code class="rounded bg-tertiary px-1 py-px">slides.md</code>.
        </p>
      </div>
      <div
        v-if="error"
        class="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        role="alert"
      >
        <span
          class="i-lucide-triangle-alert mt-px text-lg"
          aria-hidden="true"
        />
        <p class="m-0 min-w-0 whitespace-pre-wrap break-words">{{ error }}</p>
      </div>
    </section>
    <section
      class="flex min-w-0 flex-1 flex-col gap-3.5 bg-primary px-10 py-12"
    >
      <h2 class="m-0 ml-3 text-sm font-semibold text-foreground-secondary">
        Recent projects
      </h2>
      <div
        v-if="recent.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-2.5 pb-16 text-center"
      >
        <span
          class="flex size-12 items-center justify-center rounded-xl bg-tertiary text-foreground-secondary"
        >
          <span class="i-lucide-folder text-2xl" aria-hidden="true" />
        </span>
        <p class="m-0 font-semibold">No recent projects</p>
        <p class="m-0 text-sm text-foreground-secondary">
          Projects you open appear here.
        </p>
      </div>
      <ul
        v-else
        class="m-0 flex min-h-0 list-none flex-col gap-2 overflow-y-auto p-0"
      >
        <li
          v-for="project in recent"
          :key="project.path"
          class="group flex items-center gap-2 rounded-xl bg-tertiary pr-2 hover:bg-secondary"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-inherit focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed"
            :disabled="!project.isAvailable"
            @click="$emit('open', project.path)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg"
              :class="
                project.isAvailable
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-primary text-foreground-secondary'
              "
            >
              <span
                class="text-lg"
                :class="
                  project.isAvailable ? 'i-lucide-folder' : 'i-lucide-folder-x'
                "
                aria-hidden="true"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span
                class="block truncate text-sm font-semibold"
                :class="{ 'text-foreground-secondary': !project.isAvailable }"
              >
                {{ project.name }}
              </span>
              <span
                class="block truncate text-xs text-foreground-secondary"
                :title="project.path"
              >
                {{ project.path }}
              </span>
            </span>
            <span
              v-if="project.isAvailable"
              class="shrink-0 text-xs text-foreground-secondary"
            >
              {{ openedAtLabel(project.openedAt) }}
            </span>
            <span
              v-else
              class="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              Folder not found
            </span>
          </button>
          <button
            type="button"
            class="btn-ghost size-7 justify-center p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            :aria-label="`Remove ${project.name} from recent projects`"
            @click="$emit('remove', project.path)"
          >
            <span class="i-lucide-x text-base" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
