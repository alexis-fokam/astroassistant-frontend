<script setup lang="ts">
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

// Filled status cell for board tables (dark text on green/amber, white on red: AA).
const props = defineProps<{ level: Level; label?: string }>()
const style = computed(() => LEVEL_STYLES[props.level])
</script>

<template>
  <span
    role="status"
    class="flex h-9 w-full items-center justify-center gap-1.5 rounded-sm text-xs font-bold tracking-wide"
    :class="style.solid"
  >
    <component :is="style.icon" :size="14" :stroke-width="2.4" aria-hidden="true" />
    {{ label ?? style.label }}
  </span>
</template>
