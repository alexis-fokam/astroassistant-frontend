<script setup lang="ts">
import { LEVEL_HEX } from '~/constants/levels'
import type { Level } from '~/types/domain'

/**
 * Initials avatar. Crew members get their own solid colour (tone 1-4, as in Figma);
 * without a tone the brand gradient is used. An optional ring shows a status.
 */
const props = withDefaults(defineProps<{ initials: string; size?: number; tone?: number; level?: Level }>(), {
  size: 36,
})

// Static class map so Tailwind can see every class name.
const TONES: Record<number, string> = {
  1: 'bg-crew-1',
  2: 'bg-crew-2',
  3: 'bg-crew-3',
  4: 'bg-crew-4',
}
const background = computed(() => (props.tone ? TONES[props.tone] : 'bg-brand-gradient'))
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    :class="background"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${Math.round(size * 0.36)}px`,
      boxShadow: level ? `0 0 0 2px #fff, 0 0 0 4px ${LEVEL_HEX[level]}` : undefined,
    }"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>
