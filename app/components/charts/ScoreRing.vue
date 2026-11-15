<script setup lang="ts">
import { LEVEL_HEX } from '~/constants/levels'
import { levelFromScore } from '~/utils/health'

// Jauge circulaire d'un score de risque 0-100, colorée selon son niveau ; elle se remplit à l'apparition.
const props = withDefaults(
  defineProps<{ score: number; size?: number; stroke?: number; caption?: string }>(),
  { size: 132, stroke: 12 },
)

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const color = computed(() => LEVEL_HEX[levelFromScore(props.score)])
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg :width="size" :height="size" class="-rotate-90" aria-hidden="true">
      <circle :cx="size / 2" :cy="size / 2" :r="radius" stroke="#eceef4" :stroke-width="stroke" fill="none" />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke="color"
        :stroke-width="stroke"
        fill="none"
        stroke-linecap="round"
        class="ring-draw"
        :style="{ '--ring-length': `${(circumference * score) / 100}` }"
        :stroke-dasharray="`${(circumference * score) / 100} ${circumference}`"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span
        class="font-display font-bold tabular"
        :style="{ fontSize: `${Math.round(size * 0.3)}px`, lineHeight: 1 }"
      >
        {{ score }}
      </span>
      <span class="mt-1 text-xs text-ink-muted">{{ caption ?? '/ 100' }}</span>
    </div>
    <span class="sr-only">Score de risque {{ score }} sur 100</span>
  </div>
</template>
