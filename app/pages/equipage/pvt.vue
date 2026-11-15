<script setup lang="ts">
import { Activity, Pause, Play, Sparkles, Timer } from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'

/**
 * Page E-14: Psychomotor Vigilance Task (spec F8, Figma "E-14 · Test de vigilance PVT").
 * A working 3-minute test: after a random 2-10 s delay a millisecond counter starts; the
 * astronaut taps the stimulus area (or presses Space). Reactions > 500 ms are lapses,
 * presses before the stimulus are false starts (F8.2).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Test de vigilance (PVT)' })

const TEST_SECONDS = 180
const LAPSE_MS = 500
const BASELINE_MEDIAN_MS = 268
const BASELINE_LAPSES = 0.8

// Results already recorded in this session (demo state from the Figma frame), in ms.
const reactions = ref<number[]>([
  205, 228, 241, 236, 252, 259, 263, 266, 271, 274, 279, 281, 284, 288, 291, 295, 297, 302, 305, 309, 312,
  314, 318, 321, 326, 329, 333, 338, 344, 352, 361, 248, 256, 239, 286, 299, 316, 331, 247, 268, 275, 293,
  307, 342, 389, 471, 512, 584, 597,
])
const falseStarts = ref(1)
const elapsed = ref(107)
const running = ref(false)
const stimulusShownAt = ref<number | null>(null)
const counter = ref(312)

let delayTimer: ReturnType<typeof setTimeout> | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined
let frame = 0

const median = computed(() => {
  const sorted = [...reactions.value].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
})
const lapses = computed(() => reactions.value.filter((rt) => rt > LAPSE_MS).length)
const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

// Histogram: 50 ms bins from 180 to 680 ms.
const BIN_STARTS = Array.from({ length: 10 }, (_, i) => 180 + i * 50)
const histogram = computed(() =>
  BIN_STARTS.map((start) => reactions.value.filter((rt) => rt >= start && rt < start + 50).length),
)
const histogramColors = BIN_STARTS.map((start) => (start >= LAPSE_MS - 20 ? LEVEL_HEX.critical : '#2f86eb'))

function scheduleStimulus() {
  stimulusShownAt.value = null
  delayTimer = setTimeout(
    () => {
      stimulusShownAt.value = performance.now()
      const tick = () => {
        if (stimulusShownAt.value === null) return
        counter.value = Math.round(performance.now() - stimulusShownAt.value)
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    },
    2000 + Math.random() * 8000,
  )
}

function respond() {
  if (!running.value) return
  if (stimulusShownAt.value === null) {
    falseStarts.value += 1
    clearTimeout(delayTimer)
  } else {
    cancelAnimationFrame(frame)
    reactions.value.push(Math.round(performance.now() - stimulusShownAt.value))
  }
  scheduleStimulus()
}

function toggle() {
  running.value = !running.value
  if (running.value) {
    scheduleStimulus()
    clockTimer = setInterval(() => {
      elapsed.value += 1
      if (elapsed.value >= TEST_SECONDS) stop()
    }, 1000)
  } else {
    stop()
  }
}

const { savePvt } = useActions()
const saved = ref(false)

/** Store the result once the 3-minute test is complete (F8). */
function saveResult() {
  if (saved.value || elapsed.value < TEST_SECONDS) return
  saved.value = true
  savePvt({
    stimuli_count: reactions.value.length,
    median_rt_ms: median.value,
    lapses: lapses.value,
    false_starts: falseStarts.value,
  }).catch(() => (saved.value = false))
}

function stop() {
  saveResult()
  running.value = false
  clearTimeout(delayTimer)
  clearInterval(clockTimer)
  cancelAnimationFrame(frame)
  stimulusShownAt.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.code === 'Space' && running.value) {
    event.preventDefault()
    respond()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  stop()
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Test de vigilance (PVT)"
      subtitle="Psychomotor Vigilance Task · 3 minutes · mesure votre temps de réaction"
    >
      <template #actions>
        <span class="flex items-center gap-1.5 text-sm text-ink-muted tabular">
          <Timer :size="15" aria-hidden="true" /> {{ clock(elapsed) }} / {{ clock(TEST_SECONDS) }}
        </span>
        <UiButton variant="secondary" :icon="running ? Pause : Play" @click="toggle">
          {{ running ? 'Pause' : elapsed > 0 ? 'Reprendre' : 'Commencer' }}
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <section class="rounded-2xl border border-divider bg-surface p-5 shadow-card" aria-label="Zone de test">
        <button
          type="button"
          class="flex h-[460px] w-full items-center justify-center gap-3 rounded-xl bg-ink outline-offset-4 select-none"
          :aria-label="running ? 'Appuyer dès que le compteur apparaît' : 'Test en pause'"
          @pointerdown.prevent="respond"
        >
          <!-- While waiting for the stimulus the area stays blank. -->
          <template v-if="!running || stimulusShownAt !== null">
            <span class="font-display text-[150px] leading-none font-bold text-warning tabular">{{
              counter
            }}</span>
            <span class="mt-16 text-3xl text-ink-faint">ms</span>
          </template>
        </button>
        <p class="mt-4 text-center text-sm text-ink-muted">
          Touchez la zone ou appuyez sur
          <kbd class="rounded border border-line bg-subtle px-1.5 text-xs">Espace</kbd>
          dès que le compteur apparaît.
        </p>
        <UiProgress
          class="mt-4"
          :value="(elapsed / TEST_SECONDS) * 100"
          :height="6"
          label="Progression du test"
        />
      </section>

      <div class="space-y-5">
        <UiCard title="Résultats en cours" :icon="Timer">
          <dl class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-divider p-3">
              <dt class="text-xs text-ink-muted">TR médian</dt>
              <dd class="mt-1 font-semibold text-warning-ink tabular">{{ median }} ms</dd>
              <dd class="text-xs text-ink-muted">base {{ BASELINE_MEDIAN_MS }} ms</dd>
            </div>
            <div class="rounded-xl border border-divider p-3">
              <dt class="text-xs text-ink-muted">Lapses &gt; {{ LAPSE_MS }} ms</dt>
              <dd class="mt-1 font-semibold text-warning-ink tabular">{{ lapses }}</dd>
              <dd class="text-xs text-ink-muted">base {{ String(BASELINE_LAPSES).replace('.', ',') }}</dd>
            </div>
            <div class="rounded-xl border border-divider p-3">
              <dt class="text-xs text-ink-muted">Faux départs</dt>
              <dd class="mt-1 font-semibold tabular">{{ falseStarts }}</dd>
            </div>
            <div class="rounded-xl border border-divider p-3">
              <dt class="text-xs text-ink-muted">Stimuli</dt>
              <dd class="mt-1 font-semibold tabular">{{ reactions.length }}</dd>
            </div>
          </dl>
        </UiCard>

        <UiCard title="Distribution des temps de réaction" :icon="Activity">
          <ChartsBarChart
            :values="histogram"
            :max="Math.max(...histogram, 1)"
            :colors="histogramColors"
            :height="110"
            label="Distribution des temps de réaction, en rouge les lapses"
          />
          <div class="mt-1.5 flex justify-between text-[10px] text-ink-muted">
            <span v-for="start in BIN_STARTS" :key="start">{{ start }}</span>
          </div>
          <p class="mt-3 text-xs text-ink-muted">En millisecondes · en rouge : lapses</p>
        </UiCard>

        <p class="flex items-start gap-2.5 rounded-xl bg-accent-soft p-4 text-sm">
          <Sparkles :size="17" class="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          Ce résultat alimente votre score comportemental et le modèle de fatigue. L’EVA de demain 09:00 est
          signalée à risque.
        </p>
      </div>
    </div>
  </div>
</template>
