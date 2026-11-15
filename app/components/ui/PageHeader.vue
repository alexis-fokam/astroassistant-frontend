<script setup lang="ts">
// Bloc de titre des pages : H1, sous-titre d'une ligne, actions à droite.
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-2">
    <div class="min-w-0">
      <h1 class="text-[28px] leading-tight font-semibold md:text-[32px]">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1.5 max-w-3xl text-sm text-ink-muted md:text-[15px]">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot name="actions" /></div>
  </div>
</template>
