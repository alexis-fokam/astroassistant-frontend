<script setup lang="ts">
withDefaults(defineProps<{ size?: number; to?: string }>(), { size: 32, to: '/' })
</script>

<template>
  <NuxtLink :to="to" class="flex items-center gap-2.5 rounded-md" aria-label="Astro Assistant, accueil">
    <BrandMark :size="size" />
    <span class="font-display text-[17px] font-semibold tracking-tight text-ink">
      Astro<span class="text-brand-gradient">Assistant</span>
    </span>
  </NuxtLink>
</template>
