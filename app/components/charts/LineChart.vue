<script setup lang="ts">
/**
 * Courbe SVG légère (sans dépendance) : bande normale, référence individuelle, projection
 * en pointillés. Au survol (souris, doigt ou flèches du clavier), une info-bulle donne la
 * valeur du point le plus proche. La courbe se dessine de gauche à droite à l'apparition.
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    min?: number
    max?: number
    height?: number
    /** Plage normale [bas, haut], dessinée en bande verte (F1.6). */
    band?: [number, number]
    baseline?: number
    /** Valeurs qui prolongent la série, en pointillés. */
    projection?: number[]
    fill?: boolean
    grid?: boolean
    /** Description accessible du graphique. */
    label?: string
    /** Unité affichée dans l'info-bulle (bpm, ms, mSv…). */
    unit?: string
    /** Libellé de l'axe horizontal pour chaque point (date, heure…). */
    xLabels?: string[] | ((index: number) => string)
    /** Nombre de décimales dans l'info-bulle. */
    digits?: number
  }>(),
  { color: '#1f6fdb', height: 160, fill: true, grid: true, digits: 1 },
)

const VIEW_WIDTH = 600
const id = useId()
const { t } = useI18n()

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

// ------------------------------------------------------------------ info-bulle
const { hover, onMove, onLeave, onKey, wrapper } = useChartHover(totalPoints)

const allValues = computed(() => [...props.values, ...(props.projection ?? []).slice(1)])
const tip = computed(() => {
  if (hover.value === null) return null
  const i = hover.value
  const value = allValues.value[i]
  if (value === undefined) return null
  const isProjection = i >= props.values.length
  return {
    left: `${(x(i) / VIEW_WIDTH) * 100}%`,
    top: y(value),
    value: formatChartValue(value, props.digits, props.unit),
    label: chartXLabel(props.xLabels, i, totalPoints.value, t),
    projection: isProjection,
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
        <linearGradient :id="`${id}-fill`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="color" stop-opacity="0.22" />
          <stop offset="1" :stop-color="color" stop-opacity="0" />
        </linearGradient>
        <clipPath :id="`${id}-reveal`">
          <rect class="chart-reveal" x="0" y="-20" :width="VIEW_WIDTH" :height="height + 40" />
        </clipPath>
      </defs>
      <g v-if="grid" stroke="#eceef4" stroke-width="1">
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
        stroke="#9aa0b2"
        stroke-width="1.3"
        stroke-dasharray="6 5"
        vector-effect="non-scaling-stroke"
      />
      <g :clip-path="`url(#${id}-reveal)`">
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
        class="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface shadow"
        :style="{ left: tip.left, top: `${tip.top}px`, background: color }"
      />
      <ChartsChartTooltip
        :left="tip.left"
        :value="tip.value"
        :label="tip.label"
        :note="tip.projection ? t('Projection') : undefined"
      />
    </template>
  </div>
</template>
