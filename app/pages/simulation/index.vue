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
 * Pages D-01 / D-02 : panneau de démo jury (cahier des charges F15, Figma « D-01/D-02 »).
 * Injecte les scénarios S1-S6 et accélère le temps (×1 à ×1000) avec une graine fixe.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Simulation & démo jury') })

const { scenarios, crew } = useMissionData()

const SCENARIO_ICONS: Record<string, Component[]> = {
  S1: [Activity, Timer],
  S2: [Activity, Moon],
  S3: [Sun, RadioTower],
  S4: [Eye, Activity],
  S5: [Dumbbell, Activity],
  S6: [RadioTower, Send],
}

// Cartes de scénario prêtes pour le gabarit (icônes et libellé du niveau attendu, traduits).
const scenarioCards = computed(() =>
  scenarios.map((scenario) => ({
    ...scenario,
    icons: SCENARIO_ICONS[scenario.code] ?? [],
    expectedLabel: t('Attendu : {level}', { level: LEVEL_STYLES[scenario.expected].label }),
  })),
)

const { api } = useApi()
// Documentation interactive de l'API (Swagger), à côté de l'adresse du serveur.
const docsUrl = useRuntimeConfig().public.apiBase.replace(/\/api\/v1\/?$/, '') + '/docs'
// Une ref : le compilateur de gabarit déballe les refs, pas les constantes des composables.
const isLive = ref(useMissionData().source === 'api')

interface SimEvent {
  at: string
  kind: string
  message: string
}
interface SimState {
  running: boolean
  run_id: number | null
  scenario: string | null
  speed_factor: number
  sim_time: string | null
  ticks: number
  effects: { anomaly: string; label: string; crew: string[]; strength: number; expected_rules: string[] }[]
  events: SimEvent[]
}
interface AnomalyOption {
  code: string
  label: string
  description: string
  expected_rules: string[]
}

const simState = ref<SimState | null>(null)
const anomalies = ref<AnomalyOption[]>([])
const injectCrew = ref('AV-03')
const actionError = ref<string | null>(null)

const runningScenario = ref<string | null>(isLive.value ? null : 'S3')
const runningElapsed = ref(isLive.value ? 0 : 72)
let timer: ReturnType<typeof setInterval> | undefined
let poller: ReturnType<typeof setInterval> | undefined

async function refreshState() {
  if (!isLive.value) return
  try {
    simState.value = await api<SimState>('/sim/state')
    if (simState.value.running) runningScenario.value = simState.value.scenario
  } catch {
    /* serveur en redémarrage : le prochain sondage réessaie */
  }
}

onMounted(async () => {
  timer = setInterval(() => (runningElapsed.value += 1), 1000)
  if (!isLive.value) return
  anomalies.value = await api<AnomalyOption[]>('/sim/anomalies').catch(() => [])
  await refreshState()
  poller = setInterval(refreshState, 2000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(poller)
})
const runningClock = computed(
  () =>
    `${String(Math.floor(runningElapsed.value / 60)).padStart(2, '0')}:${String(runningElapsed.value % 60).padStart(2, '0')}`,
)

async function inject(code: string) {
  runningScenario.value = code
  runningElapsed.value = 0
  if (!isLive.value) return
  actionError.value = null
  try {
    await api('/sim/scenario', { method: 'POST', body: { code, speed_factor: speed.value } })
    playing.value = true
    await refreshState()
  } catch (e) {
    actionError.value = t((e as Error).message)
  }
}

async function injectAnomaly(code: string) {
  actionError.value = null
  try {
    if (!simState.value?.run_id) {
      await api('/sim/scenario', { method: 'POST', body: { code: 'S1', speed_factor: speed.value } })
      runningScenario.value = 'S1'
    }
    await api('/sim/inject', { method: 'POST', body: { anomaly: code, crew_code: injectCrew.value } })
    await refreshState()
  } catch (e) {
    actionError.value = t((e as Error).message)
  }
}

async function stopRun() {
  const id = simState.value?.run_id
  if (isLive.value && id) await api(`/sim/runs/${id}/stop`, { method: 'POST' }).catch(() => undefined)
  runningScenario.value = null
  playing.value = false
  await refreshState()
}

async function togglePlay() {
  if (playing.value) return stopRun()
  await inject(simState.value?.scenario ?? 'S1')
}

// Accélération du temps en échelle log : le curseur 0-3 donne ×1, ×10, ×100, ×1000 (F15.2).
const speedExponent = ref(Math.log10(240))
const speed = computed(() => Math.round(10 ** speedExponent.value))
const simulatedDayMinutes = computed(() => Math.max(1, Math.round((24 * 60) / speed.value)))
const playing = ref(!isLive.value)

// Applique la vitesse à la simulation en cours (anti-rebond : le curseur bouge en continu).
let speedTimer: ReturnType<typeof setTimeout> | undefined
watch(speed, (value) => {
  clearTimeout(speedTimer)
  speedTimer = setTimeout(() => {
    const id = simState.value?.run_id
    if (isLive.value && id && simState.value?.running) {
      api('/sim/speed', { method: 'POST', body: { run_id: id, speed_factor: value } }).catch(() => undefined)
    }
  }, 400)
})


const DEMO_LOG = (
  [
    { time: '14:05:32', level: 'critical', message: 'alert.created AV-02 radiation CRITICAL' },
    { time: '14:05:31', level: 'info', message: 'ws.push telemetry batch=24 · 38 ms' },
    { time: '14:05:30', level: 'info', message: 'engine.infer isolation_forest · 41 ms' },
    { time: '14:05:29', level: 'warning', message: 'score.update AV-02 behavioral 68' },
    { time: '14:05:20', level: 'info', message: 'sim.scenario S3 injected · seed 42' },
    { time: '14:04:58', level: 'nominal', message: 'protocol.run PRT-STRESS-01 step 1' },
  ] satisfies { time: string; level: Level; message: string }[]
).map((line) => ({ ...line, icon: LEVEL_STYLES[line.level].icon, ink: LEVEL_STYLES[line.level].ink }))

function eventLevel(event: SimEvent): Level {
  if (event.message.startsWith('CRITICAL')) return 'critical'
  if (event.message.startsWith('WARNING') || event.kind === 'inject') return 'warning'
  return 'info'
}

// Journal moteur en direct du simulateur, journal de démo si le serveur est injoignable.
const ENGINE_LOG = computed(() =>
  isLive.value && simState.value
    ? simState.value.events.map((event, index) => {
        const level = eventLevel(event)
        return {
          key: `${event.at}-${index}`,
          time: event.at.slice(11, 19),
          message: event.message,
          icon: LEVEL_STYLES[level].icon,
          ink: LEVEL_STYLES[level].ink,
        }
      })
    : DEMO_LOG.map((line) => ({ ...line, key: line.time })),
)

const simClock = computed(() => {
  const time = simState.value?.sim_time
  return time ? `${time.slice(0, 10)} ${time.slice(11, 16)} UTC` : '—'
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">{{ t('Simulation & démo jury') }}</h1>
        <p class="mt-0.5 text-sm text-ink-muted">
          {{ t('Données simulées, aucun capteur réel · rejouez les scénarios de référence') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" size="sm" :icon="Code" :to="docsUrl" target="_blank"
          >Swagger /docs</UiButton
        >
        <UiButton variant="ai" size="sm" :icon="Sparkles" to="/simulation?visite=1">{{
          t('Visite guidée')
        }}</UiButton>
      </div>
    </div>

    <p
      v-if="actionError"
      class="rounded-lg bg-critical-soft px-4 py-2 text-sm text-critical-ink"
      role="alert"
    >
      {{ actionError }}
    </p>

    <!-- Injection d'anomalie en direct : l'IA doit la détecter en quelques secondes -->
    <UiCard v-if="isLive" :title="t('Injecter une anomalie en direct')" :icon="Activity">
      <template #actions>
        <span class="text-xs text-ink-muted">
          {{ t('Horloge simulée') }} · {{ simClock }} · ×{{ simState?.speed_factor ?? speed }} ·
          {{ simState?.ticks ?? 0 }} {{ t('mesures') }}
        </span>
      </template>
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-sm text-ink-muted" for="inject-crew">{{ t('Astronaute') }}</label>
        <select
          id="inject-crew"
          v-model="injectCrew"
          class="h-9 rounded-lg border border-line bg-surface px-3 text-sm"
        >
          <option v-for="member in crew" :key="member.code" :value="member.code">
            {{ member.code }} · {{ member.firstName }} {{ member.lastName }}
          </option>
          <option value="all">{{ t('Tout l’équipage') }}</option>
        </select>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          v-for="option in anomalies"
          :key="option.code"
          type="button"
          class="rounded-xl border border-divider bg-surface p-3 text-left transition-colors hover:border-primary hover:bg-primary-soft"
          @click="injectAnomaly(option.code)"
        >
          <span class="block text-sm font-semibold">{{ t(option.label) }}</span>
          <span class="mt-1 block text-xs text-ink-muted">{{ t(option.description) }}</span>
          <span class="mt-2 block font-mono text-[11px] text-primary"
            >→ {{ option.expected_rules.join(' · ') }}</span
          >
        </button>
      </div>
      <ul v-if="simState?.effects.length" class="mt-4 space-y-1 text-sm">
        <li v-for="effect in simState.effects" :key="`${effect.anomaly}-${effect.crew.join()}`">
          <span class="font-medium">{{ t(effect.label) }}</span>
          <span class="text-ink-muted">
            · {{ effect.crew.join(', ') }} · {{ t('intensité') }} {{ Math.round(effect.strength * 100) }} %</span
          >
        </li>
      </ul>
    </UiCard>

    <!-- Scénarios S1-S6 (cahier des charges §4.1, F15.3) -->
    <section :aria-label="t('Scénarios')" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <h2 class="mt-4 font-semibold">{{ t(scenario.name) }}</h2>
        <p class="mt-1 flex-1 text-sm text-ink-muted">{{ t(scenario.description) }}</p>
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
          <UiButton
            v-if="runningScenario === scenario.code"
            variant="danger"
            size="sm"
            :icon="Pause"
            @click="stopRun"
          >
            {{ t('En cours') }} · {{ runningClock }}
          </UiButton>
          <UiButton v-else variant="secondary" size="sm" :icon="Play" @click="inject(scenario.code)"
            >{{ t('Injecter') }}</UiButton
          >
        </div>
      </article>
    </section>

    <div id="controle" class="grid gap-6 lg:grid-cols-3">
      <UiCard :title="t('Accélération du temps')" :icon="Timer">
        <div class="flex items-baseline justify-between">
          <p class="font-display text-3xl font-semibold text-primary tabular">×{{ speed }}</p>
          <p class="text-xs text-ink-muted">{{ t('1 jour simulé = {n} min', { n: simulatedDayMinutes }) }}</p>
        </div>
        <UiSlider
          v-model="speedExponent"
          class="mt-3"
          :min="0"
          :max="3"
          :step="0.01"
          :label="t('Accélération du temps')"
          :value-text="t('fois {n}', { n: speed })"
        />
        <div class="flex justify-between text-xs text-ink-muted">
          <span>×1</span><span>×10</span><span>×100</span><span>×1000</span>
        </div>
        <div class="mt-4 flex gap-2">
          <UiButton class="flex-1" :icon="playing ? Pause : Play" @click="togglePlay">
            {{ t(playing ? 'Pause' : 'Lecture') }}
          </UiButton>
        </div>
      </UiCard>

      <UiCard :title="t('Équipage virtuel')" :icon="Users">
        <ul class="space-y-2.5">
          <li v-for="member in crew" :key="member.code" class="flex items-center gap-3">
            <UiAvatar :initials="member.initials" :tone="member.tone" :size="28" />
            <span class="flex-1 text-sm">{{ member.code }} · {{ member.firstName }} {{ member.lastName }}</span>
            <UiStatusBadge :level="member.level" />
          </li>
        </ul>
        <p class="mt-4 flex items-center justify-between border-t border-divider pt-3 text-sm text-ink-muted">
          {{ t('Graine aléatoire') }}
          <span class="rounded-full bg-subtle px-2.5 py-0.5 font-mono text-xs text-ink">seed = 42</span>
        </p>
      </UiCard>

      <UiCard :title="t('Journal moteur en direct')" :icon="Code">
        <template #actions>
          <span
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="isLive ? 'bg-nominal-soft text-nominal-ink' : 'bg-subtle text-ink-muted'"
          >
            <span class="size-1.5 rounded-full" :class="isLive ? 'bg-nominal' : 'bg-ink-faint'" />
            {{ t(isLive ? 'Serveur connecté' : 'Mode démonstration') }}
          </span>
        </template>
        <ul class="space-y-2 rounded-xl bg-subtle p-3 font-mono text-xs" aria-live="polite">
          <li v-if="ENGINE_LOG.length === 0" class="text-ink-muted">
            {{ t('Lancez un scénario ou injectez une anomalie : le moteur IA réagit ici en direct.') }}
          </li>
          <li v-for="line in ENGINE_LOG" :key="line.key" class="flex items-center gap-2">
            <span class="text-ink-muted">{{ line.time }}</span>
            <component :is="line.icon" :size="13" :class="line.ink" aria-hidden="true" />
            <span class="truncate">{{ line.message }}</span>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
