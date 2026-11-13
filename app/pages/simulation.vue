<script setup lang="ts">
import {
  Activity,
  Code,
  Dumbbell,
  Eye,
  Moon,
  Pause,
  Play,
  RadioTower,
  RefreshCw,
  Send,
  Sparkles,
  Sun,
  Timer,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

/**
 * Pages D-01 / D-02: jury demo panel (spec F15, Figma "D-01/D-02 · Simulation jury").
 * Injects scenarios S1-S6, accelerates time (x1 to x1000) with a fixed seed.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Simulation & démo jury' })

const { scenarios, crew } = useMissionData()

const SCENARIO_ICONS: Record<string, Component[]> = {
  S1: [Activity, Timer],
  S2: [Activity, Moon],
  S3: [Sun, RadioTower],
  S4: [Eye, Activity],
  S5: [Dumbbell, Activity],
  S6: [RadioTower, Send],
}

// Template-ready scenario cards (icons and expected-level label resolved once).
const scenarioCards = scenarios.map((scenario) => ({
  ...scenario,
  icons: SCENARIO_ICONS[scenario.code] ?? [],
  expectedLabel: `Attendu : ${LEVEL_STYLES[scenario.expected].label}`,
}))

const runningScenario = ref('S3')
const runningElapsed = ref(72)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (runningElapsed.value += 1), 1000)
})
onBeforeUnmount(() => clearInterval(timer))
const runningClock = computed(
  () =>
    `${String(Math.floor(runningElapsed.value / 60)).padStart(2, '0')}:${String(runningElapsed.value % 60).padStart(2, '0')}`,
)

function inject(code: string) {
  runningScenario.value = code
  runningElapsed.value = 0
}

// Time acceleration on a log scale: slider 0-3 maps to x1, x10, x100, x1000 (spec F15.2).
const speedExponent = ref(Math.log10(240))
const speed = computed(() => Math.round(10 ** speedExponent.value))
const simulatedDayMinutes = computed(() => Math.max(1, Math.round((24 * 60) / speed.value)))
const playing = ref(true)

interface VirtualMember {
  code: string
  name: string
  initials: string
  tone?: number
  enabled: boolean
}

// Simulated crew members (spec F15.1); AV-05 is a free slot.
const virtualCrew = ref<VirtualMember[]>([
  ...crew.map((member) => ({
    code: member.code,
    name: member.lastName,
    initials: member.initials,
    tone: member.tone,
    enabled: true,
  })),
  { code: 'AV-05', name: 'libre', initials: '+', enabled: false },
])

const ENGINE_LOG = (
  [
    { time: '14:05:32', level: 'critical', message: 'alert.created AV-02 radiation CRITICAL' },
    { time: '14:05:31', level: 'info', message: 'ws.push telemetry batch=24 · 38 ms' },
    { time: '14:05:30', level: 'info', message: 'engine.infer isolation_forest · 41 ms' },
    { time: '14:05:29', level: 'warning', message: 'score.update AV-02 behavioral 68' },
    { time: '14:05:20', level: 'info', message: 'sim.scenario S3 injected · seed 42' },
    { time: '14:04:58', level: 'nominal', message: 'protocol.run PRT-STRESS-01 step 1' },
  ] satisfies { time: string; level: Level; message: string }[]
).map((line) => ({ ...line, icon: LEVEL_STYLES[line.level].icon, ink: LEVEL_STYLES[line.level].ink }))
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">Simulation & démo jury</h1>
        <p class="mt-0.5 text-sm text-ink-muted">
          Données simulées, aucun capteur réel · rejouez les scénarios de référence
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" size="sm" :icon="Code" to="http://localhost:8000/docs"
          >Swagger /docs</UiButton
        >
        <UiButton variant="secondary" size="sm" :icon="RefreshCw">Réinitialiser</UiButton>
        <UiButton variant="ai" size="sm" :icon="Sparkles">Visite guidée</UiButton>
      </div>
    </div>

    <!-- Scenarios S1-S6 (spec §4.1, F15.3) -->
    <section aria-label="Scénarios" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="scenario in scenarioCards"
        :key="scenario.code"
        class="flex flex-col rounded-2xl border bg-surface p-5 shadow-card"
        :class="
          runningScenario === scenario.code ? 'border-critical/60 ring-1 ring-critical/30' : 'border-divider'
        "
      >
        <div class="flex items-center justify-between">
          <span class="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{{
            scenario.code
          }}</span>
          <UiStatusBadge :level="scenario.expected" :label="scenario.expectedLabel" />
        </div>
        <h2 class="mt-4 font-semibold">{{ scenario.name }}</h2>
        <p class="mt-1 flex-1 text-sm text-ink-muted">{{ scenario.description }}</p>
        <div class="mt-4 flex items-center justify-between">
          <span class="flex gap-1.5 text-ink-muted">
            <component
              :is="icon"
              v-for="(icon, index) in scenario.icons"
              :key="index"
              :size="16"
              aria-hidden="true"
            />
          </span>
          <UiButton v-if="runningScenario === scenario.code" variant="danger" size="sm" :icon="Pause">
            En cours · {{ runningClock }}
          </UiButton>
          <UiButton v-else variant="secondary" size="sm" :icon="Play" @click="inject(scenario.code)"
            >Injecter</UiButton
          >
        </div>
      </article>
    </section>

    <div class="grid gap-6 lg:grid-cols-3">
      <UiCard title="Accélération du temps" :icon="Timer">
        <div class="flex items-baseline justify-between">
          <p class="font-display text-3xl font-semibold text-primary tabular">×{{ speed }}</p>
          <p class="text-xs text-ink-muted">1 jour simulé = {{ simulatedDayMinutes }} min</p>
        </div>
        <UiSlider
          v-model="speedExponent"
          class="mt-3"
          :min="0"
          :max="3"
          :step="0.01"
          label="Accélération du temps"
          :value-text="`fois ${speed}`"
        />
        <div class="flex justify-between text-xs text-ink-muted">
          <span>×1</span><span>×10</span><span>×100</span><span>×1000</span>
        </div>
        <div class="mt-4 flex gap-2">
          <UiButton class="flex-1" :icon="playing ? Pause : Play" @click="playing = !playing">
            {{ playing ? 'Pause' : 'Lecture' }}
          </UiButton>
        </div>
      </UiCard>

      <UiCard title="Équipage virtuel" :icon="Users">
        <ul class="space-y-2.5">
          <li v-for="member in virtualCrew" :key="member.code" class="flex items-center gap-3">
            <UiAvatar :initials="member.initials" :tone="member.tone" :size="28" />
            <span class="flex-1 text-sm">{{ member.code }} · {{ member.name }}</span>
            <button
              type="button"
              role="switch"
              :aria-checked="member.enabled"
              :aria-label="`Simuler ${member.code}`"
              class="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
              :class="member.enabled ? 'justify-end bg-primary' : 'bg-line'"
              @click="member.enabled = !member.enabled"
            >
              <span class="size-5 rounded-full bg-white shadow" />
            </button>
          </li>
        </ul>
        <p class="mt-4 flex items-center justify-between border-t border-divider pt-3 text-sm text-ink-muted">
          Graine aléatoire
          <span class="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-xs text-ink">seed = 42</span>
        </p>
      </UiCard>

      <UiCard title="Journal moteur en direct" :icon="Code">
        <template #actions>
          <span
            class="flex items-center gap-1.5 rounded-full bg-nominal-soft px-2.5 py-1 text-xs font-semibold text-nominal-ink"
          >
            <span class="size-1.5 rounded-full bg-nominal" /> WS connecté
          </span>
        </template>
        <ul class="space-y-2 rounded-xl bg-subtle p-3 font-mono text-xs" aria-live="polite">
          <li v-for="line in ENGINE_LOG" :key="line.time" class="flex items-center gap-2">
            <span class="text-ink-muted">{{ line.time }}</span>
            <component :is="line.icon" :size="13" :class="line.ink" aria-hidden="true" />
            <span class="truncate">{{ line.message }}</span>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
