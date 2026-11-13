<script setup lang="ts">
/**
 * Vertical bar chart (Figma E-13 "Durée de sommeil"): one coloured bar per value and an
 * optional dashed reference line. Bars are flexbox items so they keep rounded corners
 * at any width.
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    max: number
    colors: string[]
    reference?: number
    height?: number
    label: string
  }>(),
  { height: 160 },
)

const percent = (value: number) => `${Math.min(100, (value / props.max) * 100)}%`
</script>

<template>
  <div class="relative" role="img" :aria-label="label" :style="{ height: `${height}px` }">
    <div class="flex h-full items-end gap-2">
      <span
        v-for="(value, index) in values"
        :key="index"
        class="flex-1 rounded-t-md"
        :style="{ height: percent(value), background: colors[index] }"
      />
    </div>
    <span
      v-if="reference !== undefined"
      class="absolute inset-x-0 border-t-[1.5px] border-dashed border-ink-faint"
      :style="{ bottom: percent(reference) }"
    />
  </div>
</template>
