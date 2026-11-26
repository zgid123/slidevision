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
    class="mx-auto mt-8 flex max-w-3xl flex-col gap-4 rounded-2xl border border-stroke-primary bg-primary p-6"
  >
    <div class="flex gap-3.5">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      >
        <span class="i-lucide-triangle-alert text-xl" aria-hidden="true" />
      </span>
      <div>
        <h3 class="m-0 text-base font-semibold">
          {{ deckName }} could not start
        </h3>
        <p class="mt-0.5 mb-0 text-sm text-foreground-secondary">
          Fix the problem below, then try again.
        </p>
      </div>
    </div>
    <pre
      class="m-0 max-h-96 overflow-auto rounded-xl bg-secondary px-4 py-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap"
    >{{ error }}</pre>
    <div>
      <button type="button" class="btn-primary" @click="$emit('retry')">
        <span class="i-lucide-rotate-cw text-sm" aria-hidden="true" />
        Retry
      </button>
    </div>
  </section>
</template>
