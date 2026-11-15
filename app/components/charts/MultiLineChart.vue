<script setup lang="ts">
import type { ChartMarker, ChartSeries, ChartZone } from '~/types/charts'

/**
 * Courbes SVG à plusieurs séries : pleines ou en pointillés (projections), zones de valeurs
 * et repères verticaux. Une série peut commencer plus loin pour prolonger une autre courbe.
 * Au survol, l'info-bulle donne la valeur de chaque série au point le plus proche.
 */
const props = withDefaults(
  defineProps<{
    series: ChartSeries[]
    min: number
    max: number
    height?: number
    zones?: ChartZone[]
    markers?: ChartMarker[]
    grid?: boolean
    label: string
    unit?: string
    xLabels?: string[] | ((index: number) => string)
    digits?: number
  }>(),
  { height: 200, zones: () => [], markers: () => [], grid: true, digits: 1 },
)

const VIEW_WIDTH = 600
const id = useId()
const { t } = useI18n()

const pointCount = computed(() => Math.max(...props.series.map((s) => (s.offset ?? 0) + s.values.length)))
const x = (i: number) => (VIEW_WIDTH * i) / Math.max(1, pointCount.value - 1)
const y = (v: number) =>
  props.height - 4 - ((props.height - 8) * (v - props.min)) / (props.max - props.min || 1)

const lines = computed(() =>
  props.series.map((s) => ({
    ...s,
    points: s.values.map((v, i) => `${x((s.offset ?? 0) + i).toFixed(1)},${y(v).toFixed(1)}`).join(' '),
  })),
)

// ------------------------------------------------------------------ info-bulle
const { hover, onMove, onLeave, onKey, wrapper } = useChartHover(pointCount)
const tip = computed(() => {
  if (hover.value === null) return null
  const i = hover.value
  const rows = props.series.flatMap((s, k) => {
    const value = s.values[i - (s.offset ?? 0)]
    if (value === undefined) return []
    return [
      {
        name: s.name ?? t('Série {n}', { n: k + 1 }),
        value: formatChartValue(value, props.digits, props.unit),
        color: s.color,
        y: y(value),
      },
    ]
  })
  if (!rows.length) return null
  return {
    left: `${(x(i) / VIEW_WIDTH) * 100}%`,
    rows,
    label: chartXLabel(props.xLabels, i, pointCount.value, t),
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
    <svg
      :viewBox="`0 0 ${VIEW_WIDTH} ${height}`"
      preserveAspectRatio="none"
      class="block w-full overflow-visible"
      :style="{ height: `${height}px` }"
      role="img"
      :aria-label="label"
    >
      <defs>
        <clipPath :id="`${id}-reveal`">
          <rect class="chart-reveal" x="0" y="-20" :width="VIEW_WIDTH" :height="height + 40" />
        </clipPath>
      </defs>
      <rect
        v-for="(zone, index) in zones"
        :key="`zone-${index}`"
        x="0"
        :y="y(zone.to)"
        :width="VIEW_WIDTH"
        :height="Math.max(0, y(zone.from) - y(zone.to))"
        :fill="zone.color"
        :fill-opacity="zone.opacity ?? 0.1"
      />
      <g v-if="grid" stroke="#eceef4" stroke-width="1">
        <line
          v-for="k in 3"
          :key="k"
          x1="0"
          :x2="VIEW_WIDTH"
          :y1="(height * k) / 4"
          :y2="(height * k) / 4"
          vector-effect="non-scaling-stroke"
        />
      </g>
      <line
        v-for="marker in markers"
        :key="`marker-${marker.index}`"
        :x1="x(marker.index)"
        :x2="x(marker.index)"
        y1="0"
        :y2="height"
        :stroke="marker.color"
        stroke-width="1.5"
        stroke-dasharray="4 4"
        vector-effect="non-scaling-stroke"
      />
      <g :clip-path="`url(#${id}-reveal)`">
        <polyline
          v-for="(line, index) in lines"
          :key="`line-${index}`"
          :points="line.points"
          fill="none"
          :stroke="line.color"
          stroke-width="2.2"
          stroke-linejoin="round"
          stroke-linecap="round"
          :stroke-dasharray="line.dashed ? '6 6' : undefined"
          vector-effect="non-scaling-stroke"
        />
      </g>
      <line
        v-if="tip"
        :x1="x(hover!)"
        :x2="x(hover!)"
        y1="0"
        :y2="height"
        stroke="#9aa0b2"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <template v-if="tip">
      <span
        v-for="row in tip.rows"
        :key="row.name"
        class="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface shadow"
        :style="{ left: tip.left, top: `${row.y}px`, background: row.color }"
      />
      <ChartsChartTooltip :left="tip.left" :label="tip.label" :rows="tip.rows" />
    </template>
  </div>
</template>
