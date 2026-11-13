<script setup lang="ts">
import type { ChartMarker, ChartSeries, ChartZone } from '~/types/charts'

/**
 * Multi-series SVG line chart: solid or dashed series (projections), shaded value zones
 * and vertical markers. Series may start at an offset so a projection continues an
 * existing curve. Stretches to the container width; height is fixed.
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
  }>(),
  { height: 200, zones: () => [], markers: () => [], grid: true },
)

const VIEW_WIDTH = 600

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
</script>

<template>
  <svg
    :viewBox="`0 0 ${VIEW_WIDTH} ${height}`"
    preserveAspectRatio="none"
    class="block w-full overflow-visible"
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="label"
  >
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
  </svg>
</template>
