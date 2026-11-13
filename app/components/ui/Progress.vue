<script setup lang="ts">
withDefaults(defineProps<{ value: number; barClass?: string; height?: number; label?: string }>(), {
  barClass: 'bg-primary',
  height: 8,
})
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
    class="w-full overflow-hidden rounded-full bg-divider"
    :style="{ height: `${height}px` }"
  >
    <div
      class="h-full rounded-full"
      :class="barClass"
      :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
    />
  </div>
</template>
