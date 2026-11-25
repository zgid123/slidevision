<script setup lang="ts">
import type { IRecentProject } from '../interface';

defineProps<{
  recent: IRecentProject[];
  error: string | null;
}>();

defineEmits<{
  openFolder: [];
  open: [path: string];
  remove: [path: string];
}>();
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
    <header>
      <h1 class="text-3xl font-semibold">Slidevision</h1>
      <p class="mt-1 text-foreground-secondary">
        Open a folder with a <code>slidevision.json</code> or a
        <code>slides.md</code>.
      </p>
    </header>
    <p
      v-if="error"
      class="m-0 rounded-md border border-red-300 bg-red-50 p-4 text-sm whitespace-pre-wrap text-red-800"
      role="alert"
    >
      {{ error }}
    </p>
    <button
      type="button"
      class="self-start rounded-md bg-foreground-primary px-4 py-2 font-medium text-primary hover:bg-foreground-secondary"
      @click="$emit('openFolder')"
    >
      Open Folder…
    </button>
    <section>
      <h2 class="mb-3 text-sm font-medium text-foreground-secondary">
        Recent projects
      </h2>
      <p v-if="recent.length === 0" class="text-sm text-foreground-tertiary">
        Projects you open appear here.
      </p>
      <ul v-else class="m-0 flex list-none flex-col gap-2 p-0">
        <li
          v-for="project in recent"
          :key="project.path"
          class="flex items-center gap-2 rounded-md border border-stroke-primary bg-primary"
        >
          <button
            type="button"
            class="min-w-0 flex-1 px-4 py-3 text-left enabled:hover:bg-secondary disabled:cursor-not-allowed"
            :disabled="!project.isAvailable"
            @click="$emit('open', project.path)"
          >
            <span class="block truncate font-medium">{{ project.name }}</span>
            <span
              class="block truncate text-xs text-foreground-secondary"
              :title="project.path"
            >
              {{ project.path }}
            </span>
            <span v-if="!project.isAvailable" class="text-xs text-red-700">
              Folder not found
            </span>
          </button>
          <button
            type="button"
            class="mr-2 rounded-md px-2 py-1 text-sm text-foreground-secondary hover:bg-secondary"
            :aria-label="`Remove ${project.name} from recent projects`"
            @click="$emit('remove', project.path)"
          >
            Remove
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
