<script setup lang="ts">
import { windowApi } from '../api';
</script>

<template>
  <div class="group flex shrink-0 items-center gap-2">
    <button
      type="button"
      class="flex size-3 cursor-pointer items-center justify-center rounded-full border-0 bg-window-close p-0 text-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      aria-label="Close window"
      @click="windowApi.close()"
    >
      <span
        class="i-lucide-x text-[9px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      class="flex size-3 cursor-pointer items-center justify-center rounded-full border-0 bg-window-minimize p-0 text-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      aria-label="Minimize window"
      @click="windowApi.minimize()"
    >
      <span
        class="i-lucide-minus text-[9px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      class="flex size-3 cursor-pointer items-center justify-center rounded-full border-0 bg-window-maximize p-0 text-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      aria-label="Maximize window"
      @click="windowApi.toggleMaximize()"
    >
      <span
        class="i-lucide-plus text-[9px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
