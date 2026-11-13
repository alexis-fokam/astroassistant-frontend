<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next'
import { LEVEL_HEX, LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

// Vital-sign card: status, value, trend vs 7-day average (spec F1.7) and sparkline.
const props = defineProps<{
  label: string
  icon: Component
  value: string
  unit: string
  level: Level
  trend: string
  trendUp?: boolean
  values: number[]
  band?: [number, number]
  min?: number
  max?: number
  /** Chart line colour; defaults to the status colour. */
  color?: string
}>()

const isFlagged = computed(() => props.level !== 'nominal')
</script>

<template>
  <article class="flex flex-col rounded-xl border border-divider bg-surface p-4 shadow-card">
    <div class="flex items-center justify-between gap-2">
      <span class="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink-muted">
        <component :is="icon" :size="17" :stroke-width="1.75" class="shrink-0" aria-hidden="true" />
        <span class="truncate">{{ label }}</span>
      </span>
      <UiStatusBadge :level="level" />
    </div>
    <p
      class="mt-3 font-display text-[30px] leading-none font-semibold"
      :class="isFlagged && LEVEL_STYLES[level].ink"
      data-vital
    >
      {{ value }}<span class="ml-1 font-sans text-sm font-medium text-ink-muted">{{ unit }}</span>
    </p>
    <p
      class="mt-2 flex items-center gap-1 text-xs font-medium"
      :class="isFlagged ? LEVEL_STYLES[level].ink : 'text-ink-muted'"
    >
      <component
        :is="trendUp ? ArrowUpRight : ArrowDownRight"
        :size="14"
        :stroke-width="2.2"
        aria-hidden="true"
      />
      {{ trend }}
    </p>
    <ChartsLineChart
      class="mt-3"
      :values="values"
      :band="band"
      :min="min"
      :max="max"
      :height="48"
      :grid="false"
      :color="color ?? LEVEL_HEX[level]"
      :label="`Tendance ${label}`"
    />
  </article>
</template>
