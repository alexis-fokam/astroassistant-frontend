<script setup lang="ts">
/**
 * Histogramme vertical (Figma E-13) : une barre colorée par valeur et une ligne de référence
 * en pointillés. Au survol ou au clavier, l'info-bulle donne la valeur de la barre.
 * Les barres montent depuis zéro à l'apparition.
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    max: number
    colors: string[]
    reference?: number
    height?: number
    label: string
    unit?: string
    xLabels?: string[] | ((index: number) => string)
    digits?: number
  }>(),
  { height: 160, digits: 0 },
)

const { t } = useI18n()
const percent = (value: number) => `${Math.min(100, (value / props.max) * 100)}%`

const count = computed(() => props.values.length)
const { hover, onMove, onLeave, onKey, wrapper } = useChartHover(count)
const tip = computed(() => {
  if (hover.value === null) return null
  const i = hover.value
  return {
    left: `${((i + 0.5) / count.value) * 100}%`,
    value: formatChartValue(props.values[i] ?? 0, props.digits, props.unit),
    label: chartXLabel(props.xLabels, i, count.value, t),
  }
})
</script>

<template>
  <div
    ref="wrapper"
    class="chart-host relative outline-none"
    tabindex="0"
    @pointermove="onMove"
    @pointerleave="onLeave"
    @keydown="onKey"
    @blur="onLeave"
  >
    <div role="img" :aria-label="label" class="relative" :style="{ height: `${height}px` }">
      <div class="flex h-full items-end gap-2">
        <span
          v-for="(value, index) in values"
          :key="index"
          class="chart-bar flex-1 rounded-t-md transition-opacity"
          :class="hover !== null && hover !== index ? 'opacity-50' : ''"
          :style="{ height: percent(value), background: colors[index], '--i': index }"
        />
      </div>
      <span
        v-if="reference !== undefined"
        class="absolute inset-x-0 border-t-[1.5px] border-dashed border-ink-faint"
        :style="{ bottom: percent(reference) }"
      />
    </div>
    <ChartsChartTooltip v-if="tip" :left="tip.left" :value="tip.value" :label="tip.label" />
  </div>
</template>
