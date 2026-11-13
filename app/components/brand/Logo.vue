<script setup lang="ts">
withDefaults(defineProps<{ size?: number; to?: string }>(), { size: 30, to: '/' })
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex shrink-0 items-center gap-2 rounded-md"
    aria-label="Astro Assistant, accueil"
  >
    <BrandMark :size="size" />
    <span class="font-display text-[17px] font-semibold whitespace-nowrap text-ink">Astro Assistant</span>
  </NuxtLink>
</template>
