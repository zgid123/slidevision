<script setup lang="ts">
defineProps<{
  deckName: string;
  error: string;
}>();

defineEmits<{
  retry: [];
}>();
</script>

<template>
  <section
    role="alert"
    class="rounded-lg border border-stroke-secondary bg-primary p-6"
  >
    <h3 class="m-0 text-lg font-medium">{{ deckName }} could not start</h3>
    <p class="mt-2 text-sm text-foreground-secondary">
      Fix the problem below, then try again.
    </p>
    <pre
      class="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-secondary p-4 text-xs"
    >{{ error }}</pre>
    <button
      type="button"
      class="mt-4 rounded-md bg-foreground-primary px-4 py-2 text-sm font-medium text-primary hover:bg-foreground-secondary"
      @click="$emit('retry')"
    >
      Retry
    </button>
  </section>
</template>
