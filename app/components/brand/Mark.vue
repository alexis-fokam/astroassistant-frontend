<script setup lang="ts">
// Logo symbol redrawn as SVG (planet, ring, star) so it scales crisply in the header.
withDefaults(defineProps<{ size?: number }>(), { size: 32 })
const id = useId()
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-planet`" x1="18" y1="10" x2="44" y2="54">
        <stop offset="0" stop-color="#46b6f6" />
        <stop offset="0.5" stop-color="#7ff5ee" />
        <stop offset="0.62" stop-color="#c4a3f7" />
        <stop offset="1" stop-color="#a35cf5" />
      </linearGradient>
      <linearGradient :id="`${id}-ring`" x1="6" y1="44" x2="58" y2="20">
        <stop offset="0" stop-color="#2ce5e8" />
        <stop offset="0.5" stop-color="#2f8ef0" />
        <stop offset="1" stop-color="#a35cf5" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="18" :fill="`url(#${id}-planet)`" />
    <path
      d="M10 41c-4-5 10-15 24-20 12-4 22-4 21 1"
      :stroke="`url(#${id}-ring)`"
      stroke-width="4.5"
      stroke-linecap="round"
    />
    <path d="M47 9l1.6 4.2 4.4 1.3-4.4 1.3L47 20l-1.6-4.2-4.4-1.3 4.4-1.3z" fill="#a35cf5" />
  </svg>
</template>
