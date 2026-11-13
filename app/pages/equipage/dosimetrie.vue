<script setup lang="ts">
import {
  Activity,
  Check,
  FileText,
  ListChecks,
  OctagonAlert,
  Shield,
  Sun,
  TriangleAlert,
  Info,
} from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import { buildSeries } from '~/utils/series'

/**
 * Pages E-10 / E-11: dosimetry and space weather during a solar particle event
 * (spec F5, scenario S3, Figma "E-10/E-11 · Dosimétrie & alerte SPE").
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Dosimétrie' })

// Shelter countdown (spec F5.4), starting at 08:42.
const shelterSeconds = ref(8 * 60 + 42)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (shelterSeconds.value > 0) shelterSeconds.value -= 1
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))
const countdown = computed(
  () =>
    `${String(Math.floor(shelterSeconds.value / 60)).padStart(2, '0')}:${String(shelterSeconds.value % 60).padStart(2, '0')}`,
)

const range = ref('mission')
const RANGES = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: 'mission', label: 'Mission' },
]

// Cumulative mission dose (mSv) and projection to end of mission (J+200).
const cumulativeDose = Array.from({ length: 72 }, (_, i) => 50 + i * 0.55)
const doseProjection = Array.from({ length: 30 }, (_, i) => 89.1 + i * 2)
// Dose rate (mSv/h): galactic background, then the SPE spike.
const doseRate = [...buildSeries(50, 0.021, { noise: 0.004, seed: 41 }), 0.08, 0.3, 0.9, 1.5, 1.82]

const CAREER_LIMIT = 600
const careerDose = 189
const gaugeCircumference = 2 * Math.PI * 70

const SPACE_WEATHER = [
  { label: 'Flux protons ≥ 10 MeV', value: '2 340 pfu', critical: true },
  { label: 'Classe d’éruption', value: 'X8.2', critical: true },
  { label: 'Source', value: 'Catalogue DONKI local', critical: false },
  { label: 'Dernière mise à jour', value: 'J+140', critical: false },
]

const EVENTS = [
  {
    level: 'critical' as const,
    icon: OctagonAlert,
    title: 'SPE détecté, abri déclenché',
    detail: 'Aujourd’hui 14:03 · 4 membres prévenus',
  },
  {
    level: 'warning' as const,
    icon: TriangleAlert,
    title: 'Éruption X8.2, alerte précoce',
    detail: 'Aujourd’hui 13:41',
  },
  { level: 'info' as const, icon: Info, title: 'Pic de rayonnement cosmique', detail: 'J+128 · +0,4 mSv' },
]
const EVENT_INK = { critical: 'text-critical-ink', warning: 'text-warning-ink', info: 'text-info-ink' }
</script>

<template>
  <div class="space-y-6">
    <!-- SPE alert and shelter countdown (spec F5.4) -->
    <section
      class="grid items-center gap-6 rounded-2xl border border-critical/40 p-6 lg:grid-cols-[1fr_auto]"
      style="background-image: linear-gradient(100deg, #fde8ec 0%, #fff6f7 60%, #ffffff 100%)"
      role="alert"
    >
      <div class="flex gap-5">
        <span
          class="flex size-16 shrink-0 animate-alert-pulse items-center justify-center rounded-2xl bg-critical text-white"
        >
          <OctagonAlert :size="32" aria-hidden="true" />
        </span>
        <div>
          <p class="text-[11px] font-semibold tracking-wider text-critical-ink uppercase">
            Critical · événement à particules solaires (S3)
          </p>
          <h1 class="mt-1 text-[28px] leading-tight font-semibold">Mettez-vous à l’abri dans le module B2</h1>
          <p class="mt-1 text-sm text-ink-muted">
            Débit de dose à <b class="text-ink">1,82 mSv/h</b>, 86 fois le niveau habituel. Tout l’équipage a
            été prévenu.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <UiButton variant="danger" :icon="Check">Je suis à l’abri</UiButton>
            <UiButton variant="secondary" :icon="ListChecks" to="/equipage/protocoles/PRT-RAD-02">
              Ouvrir PRT-RAD-02
            </UiButton>
          </div>
        </div>
      </div>
      <div class="rounded-2xl border border-critical/30 bg-surface px-10 py-5 text-center">
        <p class="text-[11px] font-semibold tracking-wider text-critical-ink uppercase">
          Temps pour s’abriter
        </p>
        <p
          class="font-display text-[56px] leading-none font-semibold text-critical-ink tabular"
          aria-live="off"
        >
          {{ countdown }}
        </p>
        <p class="mt-2 text-xs text-ink-muted">Pic protons estimé · réf. DONKI 2017-09-10</p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <UiCard title="Dose cumulée & projection" :icon="Sun">
        <template #actions>
          <UiSegmented v-model="range" :options="RANGES" size="sm" label="Période" />
        </template>
        <div class="mb-3 flex gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-brand-blue" /> Mesurée</span
          >
          <span class="flex items-center gap-1.5">
            <i class="w-4 border-t-2 border-dotted border-brand-blue" /> Projection fin de mission
          </span>
        </div>
        <ChartsLineChart
          :values="cumulativeDose"
          :projection="doseProjection"
          color="#2f86eb"
          :height="230"
          :min="40"
          :max="150"
          label="Dose cumulée de 50 à 89 mSv, projection à 148 mSv en fin de mission"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>J+0</span><span>J+50</span><span>J+100</span><span>Aujourd’hui</span><span>Fin J+200</span>
        </div>
      </UiCard>

      <UiCard title="Limite de carrière" :icon="Shield">
        <div class="relative mx-auto size-44">
          <svg viewBox="0 0 160 160" class="size-44 -rotate-90" aria-hidden="true">
            <circle cx="80" cy="80" r="70" stroke="#eceef4" stroke-width="14" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="70"
              :stroke="LEVEL_HEX.nominal"
              stroke-width="14"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="`${(gaugeCircumference * careerDose) / CAREER_LIMIT} ${gaugeCircumference}`"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-display text-4xl font-semibold tabular">{{ careerDose }}</span>
            <span class="text-xs text-ink-muted">/ {{ CAREER_LIMIT }} mSv</span>
          </div>
        </div>
        <p class="mt-2 text-center text-xs text-ink-muted">31,5 % de la limite NASA-STD-3001</p>
        <dl class="mt-4 space-y-2 border-t border-divider pt-4 text-sm">
          <div class="flex justify-between">
            <dt class="text-ink-muted">Dose mission</dt>
            <dd class="font-semibold tabular">89,1 mSv</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Dont événement en cours</dt>
            <dd class="font-semibold text-critical-ink tabular">+2,7 mSv</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Projection fin de mission</dt>
            <dd class="font-semibold tabular">148 mSv</dd>
          </div>
        </dl>
      </UiCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <UiCard title="Débit de dose" :icon="Activity">
        <template #actions><UiStatusBadge level="critical" /></template>
        <p class="font-display text-3xl font-semibold text-critical-ink" data-vital>
          1,82 <span class="font-sans text-sm text-ink-muted">mSv/h</span>
        </p>
        <ChartsLineChart
          class="mt-3"
          :values="doseRate"
          :color="LEVEL_HEX.critical"
          :height="130"
          :min="0"
          :max="2"
          label="Débit de dose stable puis pic à 1,82 millisievert par heure"
        />
      </UiCard>

      <UiCard title="Météo spatiale (embarquée)" :icon="Sun">
        <template #actions><UiStatusBadge level="critical" label="SPE" /></template>
        <dl class="space-y-3 text-sm">
          <div v-for="row in SPACE_WEATHER" :key="row.label" class="flex justify-between gap-3">
            <dt class="text-ink-muted">{{ row.label }}</dt>
            <dd class="text-right font-semibold tabular" :class="row.critical && 'text-critical-ink'">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </UiCard>

      <UiCard title="Journal radiatif" :icon="FileText">
        <ul class="space-y-2.5">
          <li
            v-for="event in EVENTS"
            :key="event.title"
            class="flex gap-3 rounded-xl border border-divider p-3"
          >
            <component
              :is="event.icon"
              :size="18"
              class="mt-0.5 shrink-0"
              :class="EVENT_INK[event.level]"
              aria-hidden="true"
            />
            <span class="text-sm">
              <span class="block font-semibold">{{ event.title }}</span>
              <span class="block text-xs text-ink-muted">{{ event.detail }}</span>
            </span>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
