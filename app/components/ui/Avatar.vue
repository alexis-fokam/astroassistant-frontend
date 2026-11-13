<script setup lang="ts">
import { LEVEL_HEX } from '~/constants/levels'
import type { Level } from '~/types/domain'

// Initials avatar; an optional ring shows the member's status at a glance.
withDefaults(defineProps<{ initials: string; size?: number; level?: Level }>(), { size: 36 })
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display font-semibold text-white"
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
