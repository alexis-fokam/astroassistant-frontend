<script setup lang="ts">
import type { Component } from 'vue'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

/**
 * Compact key-figure card (Figma E-12, E-13 top rows): label with icon, optional status
 * badge, large value with unit and a one-line context. Flagged values take the status ink.
 */
const props = defineProps<{
  label: string
  icon: Component
  value: string
  unit?: string
  sub?: string
  level?: Level
}>()

const valueClass = computed(() =>
  props.level && props.level !== 'nominal' && props.level !== 'info' ? LEVEL_STYLES[props.level].ink : '',
)
</script>

<template>
  <article class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
    <div class="flex items-center justify-between gap-2">
      <span class="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
        <component :is="icon" :size="17" :stroke-width="1.7" class="shrink-0" aria-hidden="true" />
        <span class="truncate">{{ label }}</span>
      </span>
      <UiStatusBadge v-if="level && level !== 'nominal'" :level="level" />
    </div>
    <p class="mt-2 font-display text-[28px] leading-tight font-semibold" :class="valueClass" data-vital>
      {{ value }}<span v-if="unit" class="ml-1 font-sans text-sm font-normal text-ink-muted">{{ unit }}</span>
    </p>
    <p v-if="sub" class="mt-1 text-xs text-ink-muted">{{ sub }}</p>
  </article>
</template>
