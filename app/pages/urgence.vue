<script setup lang="ts">
import { Check, Lock, Send, Siren, Users } from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import { buildSeries } from '~/utils/series'

/**
 * Page U-02: full-screen emergency mode (spec F12.2, Figma "U-02 · Mode urgence").
 * Simplified layout for use under stress: first-aid steps, live vitals and a timer.
 */
definePageMeta({ layout: 'bare' })
useHead({ title: 'Mode urgence' })

const { findCrew, findProtocol } = useMissionData()
const patient = findCrew('AV-03')!
const firstAid = findProtocol('EMRG-01')!

const currentStep = ref(2)
const elapsed = ref(4 * 60 + 27)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (elapsed.value += 1), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const clock = computed(
  () =>
    `${String(Math.floor(elapsed.value / 60)).padStart(2, '0')}:${String(elapsed.value % 60).padStart(2, '0')}`,
)

// Only the first five steps are shown on screen; monitoring continues afterwards.
const steps = computed(() => firstAid.steps.slice(0, 5))
const STEP_DETAILS: Record<number, string> = {
  2: 'Kit médical B · tiroir 2 · les capteurs se connectent seuls',
}

const heartRate = buildSeries(48, 122, { noise: 5, drift: 8, seed: 51 })
</script>

<template>
  <div class="flex min-h-dvh flex-col border-[6px] border-critical bg-critical-soft/40">
    <header class="flex flex-wrap items-center justify-between gap-4 bg-critical px-8 py-5 text-white">
      <div class="flex items-center gap-4">
        <span class="flex size-12 items-center justify-center rounded-xl bg-white/20">
          <Siren :size="26" aria-hidden="true" />
        </span>
        <div>
          <p class="text-[11px] font-semibold tracking-wider uppercase opacity-90">
            Mode urgence · déclenché à 14:22 par Léo Martin
          </p>
          <h1 class="text-2xl font-semibold">
            Urgence médicale — {{ patient.firstName }} {{ patient.lastName }} ({{ patient.code }})
          </h1>
        </div>
      </div>
      <div class="flex items-center gap-5">
        <div class="text-right">
          <p class="text-[11px] font-semibold tracking-wider uppercase opacity-90">Écoulé</p>
          <p class="font-display text-4xl leading-none font-semibold tabular">{{ clock }}</p>
        </div>
        <UiButton variant="secondary" :icon="Lock" to="/cmo/cloture-urgence">Clôturer (CMO)</UiButton>
      </div>
    </header>

    <main class="grid flex-1 gap-6 p-8 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="first-aid">
        <p id="first-aid" class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          Premiers secours · étape {{ currentStep + 1 }} sur {{ firstAid.steps.length }}
        </p>
        <ol class="mt-4 space-y-3">
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="flex items-center gap-4 rounded-2xl border bg-surface px-5"
            :class="[
              index === currentStep ? 'border-2 border-critical py-5 shadow-card' : 'border-divider py-4',
              index < currentStep && 'opacity-70',
            ]"
            :aria-current="index === currentStep ? 'step' : undefined"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              :class="
                index < currentStep
                  ? 'bg-nominal text-ink'
                  : index === currentStep
                    ? 'bg-critical text-white'
                    : 'bg-subtle text-ink'
              "
            >
              <Check v-if="index < currentStep" :size="18" :stroke-width="3" aria-label="Terminée" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span>
              <span
                class="block font-semibold"
                :class="
                  index === currentStep ? 'text-xl' : index < currentStep ? 'text-ink-muted' : 'text-base'
                "
              >
                {{ step.title }}
              </span>
              <span
                v-if="index === currentStep && STEP_DETAILS[index]"
                class="mt-0.5 block text-sm text-ink-muted"
              >
                {{ STEP_DETAILS[index] }}
              </span>
            </span>
          </li>
        </ol>
        <div class="mt-6 flex gap-3">
          <UiButton
            size="lg"
            :icon="Check"
            @click="currentStep = Math.min(currentStep + 1, steps.length - 1)"
          >
            Étape suivante
          </UiButton>
          <UiButton size="lg" variant="secondary" @click="currentStep = Math.max(currentStep - 1, 0)">
            Étape précédente
          </UiButton>
        </div>
      </section>

      <section aria-label="Constantes en direct" class="space-y-4">
        <div class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase"
              >Fréquence cardiaque</span
            >
            <UiStatusBadge level="critical" />
          </div>
          <p class="mt-2 font-display text-5xl font-semibold text-critical-ink" data-vital>
            128 <span class="font-sans text-base text-ink-muted">bpm</span>
          </p>
          <ChartsLineChart
            class="mt-2"
            :values="heartRate"
            :color="LEVEL_HEX.critical"
            :height="56"
            :grid="false"
            :fill="false"
            label="Fréquence cardiaque élevée, en hausse"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">SpO₂</span>
              <UiStatusBadge level="warning" />
            </div>
            <p class="mt-2 font-display text-5xl font-semibold text-warning-ink" data-vital>
              92 <span class="font-sans text-base text-ink-muted">%</span>
            </p>
          </div>
          <div class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">Tension</span>
              <UiStatusBadge level="nominal" />
            </div>
            <p class="mt-2 font-display text-5xl font-semibold" data-vital>104/68</p>
          </div>
        </div>
        <p
          class="flex items-center gap-3 rounded-xl bg-nominal-soft px-4 py-3 text-sm font-medium text-nominal-ink"
        >
          <Users :size="18" aria-hidden="true" /> Équipage alerté · 4 accusés de réception sur 4
        </p>
        <p
          class="flex items-center gap-3 rounded-xl bg-nominal-soft px-4 py-3 text-sm font-medium text-nominal-ink"
        >
          <Send :size="18" aria-hidden="true" /> Paquet CRITICAL placé en tête de file vers le sol
        </p>
      </section>
    </main>
  </div>
</template>
