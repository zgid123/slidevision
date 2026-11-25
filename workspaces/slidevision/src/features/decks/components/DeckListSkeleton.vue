<script setup lang="ts">
defineProps<{
  label: string;
}>();

const placeholderCount = 6;
</script>

<template>
  <section role="status" :aria-label="label" aria-busy="true">
    <ul
      class="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      <li
        v-for="index in placeholderCount"
        :key="index"
        data-deck-skeleton
        class="animate-pulse overflow-hidden rounded-lg border border-stroke-primary bg-primary"
      >
        <div class="aspect-video bg-tertiary" />
        <div class="p-4">
          <div class="h-4 w-2/3 rounded bg-tertiary" />
        </div>
      </li>
    </ul>
  </section>
</template>
