<script setup lang="ts">
defineProps<{
  label: string;
}>();

const placeholderCount = 6;
</script>

<template>
  <section role="status" :aria-label="label" aria-busy="true">
    <p
      class="mt-0 mb-5 flex items-center gap-2 text-sm text-foreground-secondary"
      aria-hidden="true"
    >
      <span class="i-lucide-loader-circle motion-safe:animate-spin" />
      {{ label }}…
    </p>
    <ul class="m-0 grid list-none grid-cols-3 gap-6 p-0" aria-hidden="true">
      <li
        v-for="index in placeholderCount"
        :key="index"
        data-card-skeleton
        class="overflow-hidden rounded-xl border border-stroke-primary bg-primary motion-safe:animate-pulse"
      >
        <div class="aspect-video bg-tertiary" />
        <div class="flex flex-col gap-2 p-3.5">
          <div class="h-3 w-3/5 rounded bg-tertiary" />
          <div class="h-2.5 w-2/5 rounded bg-tertiary" />
        </div>
      </li>
    </ul>
  </section>
</template>
