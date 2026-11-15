<script setup lang="ts">
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleCheck,
  Flag,
  HeartPulse,
  Info,
  Package,
  Pause,
  Play,
  X,
} from 'lucide-vue-next'
import { chartColor } from '~/constants/levels'
import { buildSeries } from '~/utils/series'

/**
 * Page E-08: guided protocol player (spec F4, Figma "E-08 · Lecteur de protocole guidé").
 * The astronaut ticks each step (F4.5); timed steps show an animated breathing guide.
 * Protocols never prescribe medication on their own (F4.6).
 */
definePageMeta({
  layout: 'app',
  validate: (route) => useMissionData().findProtocol(String(route.params.code)) !== undefined,
})

const route = useRoute()
const { findProtocol } = useMissionData()
const protocol = computed(() => findProtocol(String(route.params.code))!)

useHead({ title: () => protocol.value.title })

const currentStep = ref(1)
const isRunning = ref(true)

// Breathing guide: 5 s inhale / 5 s exhale (6 breaths per minute, cardiac coherence).
const BREATH_SECONDS = 5
const breathPhase = ref<'in' | 'out'>('in')
const remainingSeconds = ref(192)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  let tick = 0
  timer = setInterval(() => {
    if (!isRunning.value) return
    tick += 1
    if (tick % BREATH_SECONDS === 0) breathPhase.value = breathPhase.value === 'in' ? 'out' : 'in'
    if (remainingSeconds.value > 0) remainingSeconds.value -= 1
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const clock = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = String(remainingSeconds.value % 60).padStart(2, '0')
  return `0${minutes}:${seconds}`
})
const progress = computed(() => (currentStep.value / protocol.value.steps.length) * 100)
const isTimedStep = computed(() => protocol.value.steps[currentStep.value]?.timer === true)

// Backend run (F4.5): started when the player opens, each step validated in order.
const { startRun, validateStep, finishRun } = useActions()
const runId = ref<number | null>(null)
onMounted(async () => {
  const run = await startRun(protocol.value.code).catch(() => null)
  if (!run) return
  runId.value = run.id
  // The player opens on step 2 (Figma frame): record the steps already shown as done.
  for (const step of protocol.value.steps.slice(0, currentStep.value)) {
    if (step.code) await validateStep(run.id, step.code).catch(() => null)
  }
})

async function completeStep() {
  const step = protocol.value.steps[currentStep.value]
  if (runId.value && step?.code) await validateStep(runId.value, step.code).catch(() => null)
  if (currentStep.value < protocol.value.steps.length - 1) {
    currentStep.value += 1
    return
  }
  if (runId.value) await finishRun(runId.value).catch(() => null)
  await navigateTo('/equipage/protocoles/termine')
}

const liveHrv = buildSeries(30, 30, { noise: 1.5, drift: 7, seed: 31 })
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">{{ protocol.title }}</h1>
        <p class="mt-0.5 text-sm text-ink-muted">
          {{ protocol.code }} · version {{ protocol.version }} · déclenché par l’alerte HRV-01
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UiStatusBadge :level="protocol.level" size="md" />
        <UiButton variant="secondary" size="sm" :icon="X" to="/equipage/protocoles">Quitter</UiButton>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-[300px_1fr_300px]">
      <!-- Steps -->
      <UiCard title="Étapes">
        <ol class="space-y-2">
          <li v-for="(step, index) in protocol.steps" :key="step.title">
            <div
              class="flex gap-3 rounded-xl border p-3"
              :class="index === currentStep ? 'border-primary bg-primary-soft' : 'border-transparent'"
              :aria-current="index === currentStep ? 'step' : undefined"
            >
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="
                  index < currentStep
                    ? 'bg-nominal text-ink'
                    : index === currentStep
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-line text-ink-muted'
                "
              >
                <Check v-if="index < currentStep" :size="15" :stroke-width="3" aria-label="Terminée" />
                <template v-else>{{ index + 1 }}</template>
              </span>
              <span class="text-sm">
                <span class="block font-semibold" :class="index < currentStep && 'text-ink-muted'">{{
                  step.title
                }}</span>
                <span class="block text-xs text-ink-muted">{{ step.minutes }} min</span>
              </span>
            </div>
          </li>
        </ol>
        <UiProgress class="mt-4" :value="progress" :height="6" label="Avancement du protocole" />
        <p class="mt-2 text-xs text-ink-muted">
          Étape {{ currentStep + 1 }} sur {{ protocol.steps.length }} · environ {{ protocol.minutes }} min au
          total
        </p>
      </UiCard>

      <!-- Breathing guide -->
      <section
        class="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-divider bg-surface shadow-card"
        aria-label="Guide de respiration"
      >
        <p class="absolute top-6 text-sm text-ink-muted">
          <span class="tabular">{{ clock }}</span> restantes · 6 respirations / min
        </p>
        <div class="relative flex size-[360px] items-center justify-center">
          <span class="absolute inset-0 rounded-full bg-info-soft/70" />
          <span class="absolute inset-10 rounded-full bg-info-soft" />
          <span
            class="relative flex size-56 flex-col items-center justify-center rounded-full bg-ai-gradient text-white shadow-raised transition-transform ease-in-out"
            :style="{
              transform: isTimedStep && breathPhase === 'in' ? 'scale(1)' : 'scale(0.82)',
              transitionDuration: `${BREATH_SECONDS}s`,
            }"
          >
            <span class="font-display text-3xl font-semibold" aria-live="polite">
              {{ isTimedStep ? (breathPhase === 'in' ? 'Inspirez' : 'Expirez') : 'Prêt' }}
            </span>
            <span class="mt-1 text-sm opacity-90">{{ BREATH_SECONDS }} secondes</span>
          </span>
        </div>
        <div class="absolute bottom-6 flex gap-3">
          <UiButton variant="secondary" :icon="isRunning ? Pause : Play" @click="isRunning = !isRunning">
            {{ isRunning ? 'Pause' : 'Reprendre' }}
          </UiButton>
          <UiButton :icon="Check" @click="completeStep">Étape terminée</UiButton>
        </div>
      </section>

      <!-- Live data and exit criterion -->
      <div class="space-y-5">
        <UiCard title="En direct" :icon="HeartPulse">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-ink-muted">Fréquence cardiaque</dt>
              <dd class="flex items-center gap-1 font-semibold tabular">
                68 bpm <ArrowDown :size="14" aria-label="en baisse" />
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-ink-muted">VFC (RMSSD)</dt>
              <dd class="flex items-center gap-1 font-semibold text-warning-ink tabular">
                36 ms <ArrowUp :size="14" aria-label="en hausse" />
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-ink-muted">Respiration</dt>
              <dd class="font-semibold tabular">6 / min</dd>
            </div>
          </dl>
          <ChartsLineChart
            class="mt-3"
            :values="liveHrv"
            :color="chartColor('warning')"
            :height="64"
            :grid="false"
            :min="20"
            :max="45"
            label="VFC en direct, en hausse"
          />
        </UiCard>

        <UiCard title="Critère de sortie" :icon="Flag">
          <p class="flex items-start gap-2 text-sm">
            <CircleCheck :size="16" class="mt-0.5 shrink-0 text-nominal-ink" aria-hidden="true" />
            {{ protocol.exitCriterion }}
          </p>
          <p class="mt-2 flex items-start gap-2 text-sm text-ink-muted">
            <Package :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
            Matériel :
            {{ protocol.materials.length ? protocol.materials.map((m) => m.name).join(', ') : 'aucun' }}
          </p>
        </UiCard>

        <p class="flex items-start gap-2.5 rounded-xl bg-info-soft p-4 text-sm">
          <Info :size="17" class="mt-0.5 shrink-0 text-info-ink" aria-hidden="true" />
          Ce protocole ne prescrit aucun médicament. En cas de doute, contactez le médecin de bord.
        </p>
      </div>
    </div>
  </div>
</template>
