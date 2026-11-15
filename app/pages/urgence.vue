<script setup lang="ts">
import { ArrowLeft, Check, CircleCheck, Lock, Send, Siren, Users } from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import type { ApiCrewVitals, ApiEmergency } from '~/types/api'
import type { Level } from '~/types/domain'
import { buildSeries } from '~/utils/series'

/**
 * Page U-02 : mode urgence plein écran (cahier des charges F12.2).
 * Tout vient de l'urgence active : patient, déclencheur, heure, étapes déjà faites.
 * Chaque « Étape suivante » est enregistrée sur l'urgence (journal d'audit), les constantes
 * du patient se rafraîchissent toutes les 5 s, et une fois les premiers secours terminés,
 * la page passe la main au médecin de bord pour la clôture.
 */
definePageMeta({ layout: 'bare' })
const { t } = useI18n()
useHead({ title: () => t('Mode urgence') })

const { findCrew, findProtocol, source } = useMissionData()
const { activeEmergency, emergencyStep } = useActions()
const { api } = useApi()

type Emergency = ApiEmergency & { steps?: { code?: string }[] }
const { data: emergency } = await useAsyncData('active-emergency', () => activeEmergency().catch(() => null))
const event = computed(() => emergency.value as Emergency | null)

const patient = computed(() => findCrew(event.value?.patient_code ?? 'AV-03') ?? findCrew('AV-03')!)
const trigger = computed(() => findCrew(event.value?.triggered_by_code ?? patient.value.code))
const triggeredAt = computed(() =>
  event.value ? new Date(event.value.triggered_at).toISOString().slice(11, 16) : null,
)

// Toutes les étapes du protocole de premiers secours : « étape X sur N » reste cohérent.
const firstAid = findProtocol('EMRG-01')!
const steps = computed(() => firstAid.steps)
const total = computed(() => steps.value.length)

// Reprise là où l'équipage s'est arrêté : les étapes déjà enregistrées sur l'urgence.
const done = ref(Math.min(event.value?.steps?.length ?? 0, total.value))
const finished = computed(() => done.value >= total.value)
const saving = ref(false)
const stepError = ref<string | null>(null)

async function nextStep() {
  if (finished.value || saving.value) return
  const step = steps.value[done.value]
  saving.value = true
  stepError.value = null
  try {
    if (event.value && step?.code) await emergencyStep(event.value.id, step.code)
    done.value += 1
  } catch (e) {
    stepError.value = t((e as Error).message)
  } finally {
    saving.value = false
  }
}

function previousStep() {
  done.value = Math.max(done.value - 1, 0)
}

// Chronomètre depuis l'ouverture de l'écran d'urgence.
const elapsed = ref(0)
const clock = computed(
  () =>
    `${String(Math.floor(elapsed.value / 60)).padStart(2, '0')}:${String(elapsed.value % 60).padStart(2, '0')}`,
)

// Constantes du patient en direct (repli : valeurs de démonstration).
interface Vital {
  value: number | null
  level: Level
  points: number[]
}
const vitals = ref<Record<string, Vital>>({})
async function refreshVitals() {
  if (source !== 'api') return
  try {
    const data = await api<ApiCrewVitals>(`/crew/${patient.value.code}/vitals/latest`)
    vitals.value = Object.fromEntries(
      Object.entries(data.vitals).map(([metric, v]) => [
        metric,
        { value: v.value, level: v.level, points: v.points.map((p) => p.value) },
      ]),
    )
  } catch {
    /* serveur momentanément indisponible : on garde les dernières valeurs */
  }
}
const DEMO_HR = buildSeries(48, 122, { noise: 5, drift: 8, seed: 51 })
const hr = computed(() => vitals.value.heart_rate)
const spo2 = computed(() => vitals.value.spo2)
const sys = computed(() => vitals.value.systolic_bp)
const dia = computed(() => vitals.value.diastolic_bp)
// Couleur du chiffre selon le niveau réel de la constante.
const INK: Record<Level, string> = {
  critical: 'text-critical-ink',
  warning: 'text-warning-ink',
  nominal: 'text-ink',
  info: 'text-ink',
}
const fmt = (v: number | null | undefined, fallback: string) =>
  v === null || v === undefined ? fallback : String(Math.round(v))

let timer: ReturnType<typeof setInterval> | undefined
let poller: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (elapsed.value += 1), 1000)
  refreshVitals()
  poller = setInterval(refreshVitals, 5000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearInterval(poller)
})
</script>

<template>
  <div class="flex min-h-dvh flex-col border-[6px] border-critical bg-critical-soft/40">
    <header
      class="flex flex-wrap items-center justify-between gap-4 bg-critical px-6 py-5 text-white sm:px-10"
    >
      <div class="flex items-center gap-4">
        <span class="flex size-12 items-center justify-center rounded-xl bg-white/20">
          <Siren :size="26" aria-hidden="true" />
        </span>
        <div>
          <p class="text-[11px] font-semibold tracking-wider uppercase opacity-90">
            {{ t('Mode urgence') }}
            <template v-if="triggeredAt">
              · {{ t('déclenché à {time}', { time: triggeredAt }) }}
              <template v-if="trigger">
                {{ t('par {name}', { name: `${trigger.firstName} ${trigger.lastName}` }) }}</template
              >
            </template>
          </p>
          <h1 class="text-2xl font-semibold">
            {{ t('Urgence médicale') }} — {{ patient.firstName }} {{ patient.lastName }} ({{ patient.code }})
          </h1>
        </div>
      </div>
      <div class="flex items-center gap-5">
        <div class="text-right">
          <p class="text-[11px] font-semibold tracking-wider uppercase opacity-90">{{ t('Écoulé') }}</p>
          <p class="font-display text-4xl leading-none font-semibold tabular">{{ clock }}</p>
        </div>
        <UiButton variant="secondary" :icon="Lock" to="/cmo/cloture-urgence">{{
          t('Clôturer (CMO)')
        }}</UiButton>
      </div>
    </header>

    <main class="grid flex-1 gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="first-aid">
        <p id="first-aid" class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          {{ t('Premiers secours') }} ·
          <template v-if="finished">{{ t('terminés') }}</template>
          <template v-else>{{ t('étape {n} sur {total}', { n: done + 1, total }) }}</template>
        </p>
        <ol class="mt-4 space-y-3">
          <li
            v-for="(step, index) in steps"
            :key="step.code ?? step.title"
            class="flex items-center gap-4 rounded-2xl border bg-surface px-6 transition-all"
            :class="[
              index === done ? 'border-2 border-critical py-5 shadow-card' : 'border-divider py-4',
              index < done && 'opacity-70',
            ]"
            :aria-current="index === done ? 'step' : undefined"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              :class="
                index < done
                  ? 'bg-nominal text-ink'
                  : index === done
                    ? 'bg-critical text-white'
                    : 'bg-subtle text-ink'
              "
            >
              <Check v-if="index < done" :size="18" :stroke-width="3" :aria-label="t('Terminée')" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span class="flex-1">
              <span
                class="block font-semibold"
                :class="index === done ? 'text-xl' : index < done ? 'text-ink-muted' : 'text-base'"
              >
                {{ t(step.title) }}
              </span>
              <span v-if="index === done && step.minutes" class="mt-0.5 block text-sm text-ink-muted">
                {{ t('Environ {n} min', { n: step.minutes }) }}
              </span>
            </span>
          </li>
        </ol>

        <!-- Fin des premiers secours : passage de relais au médecin de bord -->
        <div
          v-if="finished"
          class="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-nominal/40 bg-nominal-soft px-6 py-5"
        >
          <CircleCheck :size="28" class="text-nominal-ink" aria-hidden="true" />
          <div class="flex-1">
            <p class="font-semibold text-nominal-ink">{{ t('Premiers secours terminés') }}</p>
            <p class="text-sm text-ink-muted">
              {{ t('Le médecin de bord poursuit la prise en charge et clôture l’urgence.') }}
            </p>
          </div>
          <UiButton :icon="Lock" to="/cmo/cloture-urgence">{{ t('Clôturer (CMO)') }}</UiButton>
        </div>

        <p
          v-if="stepError"
          class="mt-4 rounded-lg bg-critical-soft px-4 py-2 text-sm text-critical-ink"
          role="alert"
        >
          {{ stepError }}
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <UiButton v-if="!finished" size="lg" :icon="Check" :disabled="saving" @click="nextStep">
            {{ t(done === total - 1 ? 'Terminer les premiers secours' : 'Étape suivante') }}
          </UiButton>
          <UiButton
            size="lg"
            variant="secondary"
            :icon="ArrowLeft"
            :disabled="done === 0"
            @click="previousStep"
          >
            {{ t('Étape précédente') }}
          </UiButton>
        </div>
      </section>

      <section :aria-label="t('Constantes en direct')" class="space-y-4">
        <div class="rounded-2xl border border-divider bg-surface p-6 shadow-card">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">{{
              t('Fréquence cardiaque')
            }}</span>
            <UiStatusBadge :level="hr?.level ?? 'critical'" />
          </div>
          <p class="mt-2 font-display text-5xl font-semibold" :class="INK[hr?.level ?? 'critical']" data-vital>
            {{ fmt(hr?.value, '128') }} <span class="font-sans text-base text-ink-muted">bpm</span>
          </p>
          <ChartsLineChart
            class="mt-2"
            :values="hr?.points.length ? hr.points : DEMO_HR"
            :color="LEVEL_HEX[hr?.level ?? 'critical']"
            :height="56"
            :grid="false"
            :fill="false"
            unit="bpm"
            :label="t('Fréquence cardiaque du patient')"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl border border-divider bg-surface p-6 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">SpO₂</span>
              <UiStatusBadge :level="spo2?.level ?? 'warning'" />
            </div>
            <p class="mt-2 font-display text-5xl font-semibold" :class="INK[spo2?.level ?? 'warning']" data-vital>
              {{ fmt(spo2?.value, '92') }} <span class="font-sans text-base text-ink-muted">%</span>
            </p>
          </div>
          <div class="rounded-2xl border border-divider bg-surface p-6 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">{{
                t('Tension')
              }}</span>
              <UiStatusBadge :level="sys?.level ?? 'nominal'" />
            </div>
            <p class="mt-2 font-display text-5xl font-semibold" data-vital>
              {{ fmt(sys?.value, '104') }}/{{ fmt(dia?.value, '68') }}
            </p>
          </div>
        </div>
        <p
          class="flex items-center gap-3 rounded-xl bg-nominal-soft px-5 py-3 text-sm font-medium text-nominal-ink"
        >
          <Users :size="18" aria-hidden="true" /> {{ t('Équipage alerté') }}
        </p>
        <p
          class="flex items-center gap-3 rounded-xl bg-nominal-soft px-5 py-3 text-sm font-medium text-nominal-ink"
        >
          <Send :size="18" aria-hidden="true" /> {{ t('Paquet CRITICAL placé en tête de file vers le sol') }}
        </p>
      </section>
    </main>
  </div>
</template>
