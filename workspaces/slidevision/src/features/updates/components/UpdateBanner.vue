<script setup lang="ts">
import { type TUpdateState, updateStatus } from '../interface';

defineProps<{
  state: TUpdateState;
}>();

defineEmits<{
  install: [];
  retry: [];
  dismiss: [];
}>();
</script>

<template>
  <aside
    v-if="state.status !== updateStatus.idle"
    class="fixed right-4 bottom-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
    aria-label="Application update"
  >
    <div
      v-if="state.status === updateStatus.checking"
      class="flex items-center gap-3 rounded-xl border border-stroke-primary bg-primary px-4 py-3 text-sm text-foreground-primary shadow-lg"
      role="status"
    >
      <span
        class="i-lucide-loader-circle text-lg text-indigo-600 motion-safe:animate-spin dark:text-indigo-400"
        aria-hidden="true"
      />
      <p class="m-0 flex-1 font-medium">Checking for updates…</p>
    </div>

    <div
      v-else-if="state.status === updateStatus.upToDate"
      class="flex items-center gap-3 rounded-xl border border-stroke-primary bg-primary px-4 py-3 text-sm text-foreground-primary shadow-lg"
      role="status"
    >
      <span
        class="i-lucide-check text-lg text-indigo-600 dark:text-indigo-400"
        aria-hidden="true"
      />
      <p class="m-0 flex-1 font-medium">Slidevision is up to date</p>
      <button
        type="button"
        class="btn-ghost size-7 justify-center p-0"
        aria-label="Dismiss update notification"
        @click="$emit('dismiss')"
      >
        <span class="i-lucide-x text-base" aria-hidden="true" />
      </button>
    </div>

    <div
      v-else-if="state.status === updateStatus.available"
      class="flex flex-col gap-3 rounded-xl border border-stroke-primary bg-primary px-4 py-3.5 text-sm text-foreground-primary shadow-lg"
      role="status"
    >
      <div class="flex items-start gap-3">
        <span
          class="i-lucide-arrow-down-circle mt-0.5 text-lg text-indigo-600 dark:text-indigo-400"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="m-0 font-semibold">
            Slidevision {{ state.version }} is available
          </p>
          <p
            v-if="state.notes"
            class="mt-1 mb-0 line-clamp-3 text-xs leading-relaxed text-foreground-secondary"
          >
            {{ state.notes }}
          </p>
        </div>
        <button
          type="button"
          class="btn-ghost -mt-1 -mr-1 size-7 justify-center p-0"
          aria-label="Dismiss update notification"
          @click="$emit('dismiss')"
        >
          <span class="i-lucide-x text-base" aria-hidden="true" />
        </button>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-primary" @click="$emit('install')">
          Update
        </button>
      </div>
    </div>

    <div
      v-else-if="state.status === updateStatus.downloading"
      class="flex flex-col gap-2.5 rounded-xl border border-stroke-primary bg-primary px-4 py-3.5 text-sm text-foreground-primary shadow-lg"
      role="status"
    >
      <div class="flex items-center gap-3">
        <span
          class="i-lucide-loader-circle text-lg text-indigo-600 motion-safe:animate-spin dark:text-indigo-400"
          aria-hidden="true"
        />
        <p class="m-0 flex-1 font-medium">Downloading {{ state.version }}…</p>
        <span
          v-if="state.progress !== null"
          class="text-xs font-medium text-foreground-secondary tabular-nums"
        >
          {{ state.progress }}%
        </span>
      </div>
      <div
        v-if="state.progress !== null"
        class="h-1.5 w-full overflow-hidden rounded-full bg-tertiary"
      >
        <div
          class="h-full rounded-full bg-indigo-600 motion-safe:transition-[width]"
          :style="{ width: `${state.progress}%` }"
        />
      </div>
    </div>

    <div
      v-else-if="state.status === updateStatus.ready"
      class="flex items-center gap-3 rounded-xl border border-stroke-primary bg-primary px-4 py-3 text-sm text-foreground-primary shadow-lg"
      role="status"
    >
      <span
        class="i-lucide-refresh-cw text-lg text-indigo-600 dark:text-indigo-400"
        aria-hidden="true"
      />
      <p class="m-0 flex-1 font-medium">Restarting to update…</p>
    </div>

    <div
      v-else-if="state.status === updateStatus.failed"
      class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-lg dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      role="alert"
    >
      <div class="flex items-start gap-2.5">
        <span
          class="i-lucide-triangle-alert mt-px text-lg"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="m-0 font-semibold">Update failed</p>
          <p class="mt-1 mb-0 break-words text-xs opacity-90">
            {{ state.message }}
          </p>
        </div>
        <button
          type="button"
          class="btn-ghost -mt-1 -mr-1 size-7 justify-center p-0 text-inherit hover:bg-red-100 hover:text-inherit dark:hover:bg-red-900"
          aria-label="Dismiss update notification"
          @click="$emit('dismiss')"
        >
          <span class="i-lucide-x text-base" aria-hidden="true" />
        </button>
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="btn bg-red-700 font-semibold text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700"
          @click="state.canRetryInstall ? $emit('install') : $emit('retry')"
        >
          Retry
        </button>
      </div>
    </div>
  </aside>
</template>
