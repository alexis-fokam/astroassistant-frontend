<script setup lang="ts">
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

const props = withDefaults(
  defineProps<{
    level: Level
    label?: string
    variant?: 'soft' | 'solid'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { variant: 'soft', size: 'sm' },
)

const style = computed(() => LEVEL_STYLES[props.level])
const SIZES = {
  sm: 'h-6 px-2 text-[11px] gap-1',
  md: 'h-8 px-3 text-xs gap-1.5',
  lg: 'h-10 px-4 text-sm gap-2',
}
const ICON_SIZES = { sm: 13, md: 15, lg: 18 }
</script>

<template>
  <span
    role="status"
    class="inline-flex shrink-0 items-center rounded-full font-bold tracking-wide whitespace-nowrap"
    :class="[
      variant === 'solid' ? style.solid : style.soft,
      SIZES[size],
      level === 'critical' ? 'badge-critical' : '',
    ]"
  >
    <component :is="style.icon" :size="ICON_SIZES[size]" :stroke-width="2.4" aria-hidden="true" />
    {{ label ?? style.label }}
  </span>
</template>
