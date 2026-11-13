<script setup lang="ts">
/**
 * Lightweight SVG line chart (no dependency): normal-range band, individual baseline,
 * dashed projection. Stretches to the container width; height is fixed.
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    min?: number
    max?: number
    height?: number
    /** Normal range [low, high], drawn as a green band (spec F1.6). */
    band?: [number, number]
    baseline?: number
    /** Values continuing the series, drawn dashed. */
    projection?: number[]
    fill?: boolean
    grid?: boolean
    /** Accessible description of the chart. */
    label?: string
  }>(),
  { color: '#1f6fdb', height: 160, fill: true, grid: true },
)

const VIEW_WIDTH = 600
const id = useId()

const bounds = computed(() => {
  const all = [...props.values, ...(props.projection ?? [])]
  return { lo: props.min ?? Math.min(...all), hi: props.max ?? Math.max(...all) }
})
const totalPoints = computed(() => props.values.length + Math.max(0, (props.projection?.length ?? 0) - 1))

const x = (i: number) => (VIEW_WIDTH * i) / Math.max(1, totalPoints.value - 1)
const y = (v: number) => {
  const { lo, hi } = bounds.value
  return props.height - 6 - ((props.height - 12) * (v - lo)) / (hi - lo || 1)
}
const toPoints = (values: number[], offset = 0) =>
  values.map((v, i) => `${x(offset + i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

const line = computed(() => toPoints(props.values))
const area = computed(
  () => `0,${props.height} ${line.value} ${x(props.values.length - 1).toFixed(1)},${props.height}`,
)
const projection = computed(() =>
  props.projection?.length ? toPoints(props.projection, props.values.length - 1) : '',
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
    <defs>
      <linearGradient :id="`${id}-fill`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity="0.22" />
        <stop offset="1" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g v-if="grid" stroke="#e7e9ef" stroke-width="1">
      <line
        v-for="k in 3"
        :key="k"
        x1="0"
        :x2="VIEW_WIDTH"
        :y1="(height * k) / 4"
        :y2="(height * k) / 4"
        stroke-dasharray="3 5"
        vector-effect="non-scaling-stroke"
      />
    </g>
    <rect
      v-if="band"
      x="0"
      :y="y(band[1])"
      :width="VIEW_WIDTH"
      :height="Math.max(0, y(band[0]) - y(band[1]))"
      fill="#00c875"
      fill-opacity="0.08"
    />
    <line
      v-if="baseline !== undefined"
      x1="0"
      :x2="VIEW_WIDTH"
      :y1="y(baseline)"
      :y2="y(baseline)"
      stroke="#676879"
      stroke-width="1.3"
      stroke-dasharray="6 5"
      vector-effect="non-scaling-stroke"
    />
    <polygon v-if="fill" :points="area" :fill="`url(#${id}-fill)`" />
    <polyline
      :points="line"
      fill="none"
      :stroke="color"
      stroke-width="2.2"
      stroke-linejoin="round"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
    <polyline
      v-if="projection"
      :points="projection"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-dasharray="6 6"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>
