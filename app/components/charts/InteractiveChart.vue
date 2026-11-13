<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

/**
 * Time-series chart with tooltip and zoom (spec F1.6, Figma "E-03 · Détail d'une métrique").
 * - Hover shows the nearest sample with its status.
 * - Drag across the plot to zoom into a time window; the brush below shows the window.
 * Values are evenly spaced over `hours` hours starting at 00:00.
 */
const props = withDefaults(
  defineProps<{
    values: number[]
    min: number
    max: number
    unit: string
    /** Normal range drawn as a green band. */
    band: [number, number]
    /** Highlighted time ranges in hours (e.g. exercise). */
    highlights?: { from: number; to: number }[]
    hours?: number
    yTicks?: number[]
    label: string
    levelOf: (value: number) => Level
  }>(),
  { highlights: () => [], hours: 24, yTicks: () => [] },
)

const WIDTH = 900
const HEIGHT = 280
const PAD_LEFT = 36

const range = ref<[number, number]>([0, props.values.length - 1])
const hoverIndex = ref<number | null>(null)
const dragStart = ref<number | null>(null)
const dragEnd = ref<number | null>(null)
const svg = ref<SVGSVGElement>()

const visible = computed(() => props.values.slice(range.value[0], range.value[1] + 1))
const stepHours = computed(() => props.hours / (props.values.length - 1))

const x = (i: number) =>
  PAD_LEFT + ((WIDTH - PAD_LEFT) * (i - range.value[0])) / Math.max(1, range.value[1] - range.value[0])
const y = (v: number) => HEIGHT - 8 - ((HEIGHT - 16) * (v - props.min)) / (props.max - props.min)
const indexFromHours = (h: number) => h / stepHours.value

const points = computed(() =>
  visible.value.map((v, i) => `${x(range.value[0] + i).toFixed(1)},${y(v).toFixed(1)}`).join(' '),
)

const formatTime = (index: number) => {
  const minutes = Math.round(index * stepHours.value * 60)
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
const xTicks = computed(() => {
  const count = 6
  return Array.from(
    { length: count + 1 },
    (_, k) => range.value[0] + ((range.value[1] - range.value[0]) * k) / count,
  )
})

function indexAt(event: PointerEvent): number {
  const rect = svg.value!.getBoundingClientRect()
  const ratio = ((event.clientX - rect.left) / rect.width) * WIDTH
  const relative = (ratio - PAD_LEFT) / (WIDTH - PAD_LEFT)
  const index = Math.round(range.value[0] + relative * (range.value[1] - range.value[0]))
  return Math.min(range.value[1], Math.max(range.value[0], index))
}

function onMove(event: PointerEvent) {
  hoverIndex.value = indexAt(event)
  if (dragStart.value !== null) dragEnd.value = hoverIndex.value
}
function onDown(event: PointerEvent) {
  dragStart.value = indexAt(event)
  dragEnd.value = dragStart.value
}
function onUp() {
  if (dragStart.value !== null && dragEnd.value !== null && Math.abs(dragEnd.value - dragStart.value) >= 4) {
    range.value = [Math.min(dragStart.value, dragEnd.value), Math.max(dragStart.value, dragEnd.value)]
  }
  dragStart.value = null
  dragEnd.value = null
}
function resetZoom() {
  range.value = [0, props.values.length - 1]
}

const hovered = computed(() => {
  if (hoverIndex.value === null) return null
  const value = props.values[hoverIndex.value]!
  const level = props.levelOf(value)
  return { index: hoverIndex.value, value, time: formatTime(hoverIndex.value), style: LEVEL_STYLES[level] }
})
const tooltipLeft = computed(() => (hovered.value ? `${(x(hovered.value.index) / WIDTH) * 100}%` : '0'))
const isZoomed = computed(() => range.value[0] !== 0 || range.value[1] !== props.values.length - 1)
const brush = computed(() => ({
  left: `${(range.value[0] / (props.values.length - 1)) * 100}%`,
  width: `${((range.value[1] - range.value[0]) / (props.values.length - 1)) * 100}%`,
}))
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
      <slot name="legend" />
      <UiButton
        class="ml-auto"
        variant="ghost"
        size="sm"
        :icon="RefreshCw"
        :disabled="!isZoomed"
        @click="resetZoom"
      >
        Réinitialiser le zoom
      </UiButton>
    </div>
    <div class="relative">
      <svg
        ref="svg"
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        class="block w-full touch-none select-none"
        :style="{ height: `${HEIGHT}px` }"
        preserveAspectRatio="none"
        role="img"
        :aria-label="label"
        @pointermove="onMove"
        @pointerleave="hoverIndex = null"
        @pointerdown="onDown"
        @pointerup="onUp"
      >
        <g stroke="#eceef4">
          <line
            v-for="tick in yTicks"
            :key="tick"
            :x1="PAD_LEFT"
            :x2="WIDTH"
            :y1="y(tick)"
            :y2="y(tick)"
            vector-effect="non-scaling-stroke"
          />
        </g>
        <rect
          :x="PAD_LEFT"
          :y="y(band[1])"
          :width="WIDTH - PAD_LEFT"
          :height="y(band[0]) - y(band[1])"
          fill="#00c875"
          fill-opacity="0.12"
        />
        <rect
          v-for="zone in highlights"
          :key="zone.from"
          :x="Math.max(PAD_LEFT, x(indexFromHours(zone.from)))"
          y="0"
          :width="Math.max(0, x(indexFromHours(zone.to)) - Math.max(PAD_LEFT, x(indexFromHours(zone.from))))"
          :height="HEIGHT"
          fill="#9b5cf2"
          fill-opacity="0.1"
        />
        <rect
          v-if="dragStart !== null && dragEnd !== null"
          :x="x(Math.min(dragStart, dragEnd))"
          y="0"
          :width="Math.abs(x(dragEnd) - x(dragStart))"
          :height="HEIGHT"
          fill="#2b6fe6"
          fill-opacity="0.1"
        />
        <polyline
          :points="points"
          fill="none"
          stroke="#2f86eb"
          stroke-width="2"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
        <line
          v-if="hovered"
          :x1="x(hovered.index)"
          :x2="x(hovered.index)"
          y1="0"
          :y2="HEIGHT"
          stroke="#9aa0b2"
          stroke-dasharray="3 4"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <span
        v-for="tick in yTicks"
        :key="`label-${tick}`"
        class="pointer-events-none absolute left-0 -translate-y-1/2 text-[11px] text-ink-faint"
        :style="{ top: `${(y(tick) / HEIGHT) * 100}%` }"
        aria-hidden="true"
      >
        {{ tick }}
      </span>

      <div
        v-if="hovered"
        class="pointer-events-none absolute top-6 z-10 -translate-x-1/2 rounded-xl border border-divider bg-surface px-3 py-2 shadow-raised"
        :style="{ left: tooltipLeft }"
        role="status"
      >
        <p class="text-xs text-ink-muted">Aujourd’hui {{ hovered.time }}</p>
        <p class="font-semibold tabular">{{ Math.round(hovered.value) }} {{ unit }}</p>
        <span
          class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
          :class="hovered.style.soft"
        >
          <component :is="hovered.style.icon" :size="12" aria-hidden="true" /> {{ hovered.style.label }}
        </span>
      </div>
    </div>

    <div class="mt-2 flex justify-between pl-9 text-xs text-ink-muted">
      <span v-for="tick in xTicks" :key="tick">{{ formatTime(tick) }}</span>
    </div>
    <div class="relative mt-3 h-8 rounded-lg bg-subtle" aria-hidden="true">
      <span class="absolute inset-y-0 rounded-lg border-2 border-primary bg-primary-soft/70" :style="brush" />
    </div>
    <p class="mt-1.5 text-xs text-ink-faint">Glissez sur le graphique pour zoomer sur une période.</p>
  </div>
</template>
