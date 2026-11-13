<script setup lang="ts">
import {
  Activity,
  Check,
  CircleCheck,
  Droplet,
  Eye,
  HeartCrack,
  MessageSquare,
  Mic,
  Moon,
  Smile,
  TriangleAlert,
  Users,
  Wind,
} from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * Page E-05: daily qualitative check-in (spec F3, Figma "E-05 · Check-in quotidien").
 * Target under 90 s: big buttons and sliders, no mandatory free text (F3.1).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Check-in quotidien' })

const { mission } = useMissionData()

const SEVERITY_OPTIONS = ['Aucun', 'Léger', 'Modéré', 'Sévère']

interface SymptomQuestion {
  id: string
  label: string
  icon: Component
  hint?: string
}

// Symptom items rated 0-3 (spec F3.2); vision change is the SANS indicator.
const SYMPTOMS: SymptomQuestion[] = [
  { id: 'headache', label: 'Maux de tête', icon: Activity },
  {
    id: 'vision_change',
    label: 'Vision floue ou modifiée',
    icon: Eye,
    hint: 'Indice SANS · 2ᵉ jour de suite',
  },
  { id: 'congestion', label: 'Congestion nasale', icon: Wind },
  { id: 'back_pain', label: 'Douleurs dorsales', icon: HeartCrack },
  { id: 'nausea', label: 'Nausées', icon: Droplet },
  { id: 'isolation', label: 'Sentiment d’isolement', icon: Users },
]

const symptoms = reactive<Record<string, number | null>>({
  headache: 1,
  vision_change: 1,
  congestion: 0,
  back_pain: 2,
  nausea: 0,
  isolation: null,
})

// Self-rated scales 0-10.
const SCALES = [
  { id: 'sleep_quality', label: 'Qualité du sommeil', icon: Moon, low: 'Très mauvais', high: 'Excellent' },
  { id: 'mood', label: 'Humeur', icon: Smile, low: 'Très mauvais', high: 'Excellent' },
  { id: 'stress', label: 'Niveau de stress', icon: Activity, low: 'Calme', high: 'Très stressé' },
] as const

const scales = reactive<Record<(typeof SCALES)[number]['id'], number>>({
  sleep_quality: 3.5,
  mood: 6,
  stress: 7,
})

const note = ref('')

const answered = computed(
  () => Object.values(symptoms).filter((v) => v !== null).length + Object.keys(scales).length,
)
const total = SYMPTOMS.length + SCALES.length + 1
const elapsedSeconds = 38
const TARGET_SECONDS = 90

// SANS signal: vision change plus headache (scenario S4).
const sansSignal = computed(() => (symptoms.vision_change ?? 0) >= 1 && (symptoms.headache ?? 0) >= 1)

const ringCircumference = 2 * Math.PI * 34

function formatScale(value: number) {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header with timer and progress -->
    <section
      class="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-divider bg-surface p-6 shadow-card"
    >
      <div>
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          Check-in quotidien · jour {{ mission.day }}
        </p>
        <h1 class="mt-1 text-[28px] font-semibold">Comment vous sentez-vous ce matin ?</h1>
        <p class="mt-1 text-sm text-ink-muted">
          Gros boutons, aucune saisie obligatoire. Vos réponses mettent à jour vos scores immédiatement.
        </p>
      </div>
      <div class="flex items-center gap-5">
        <div class="relative size-20">
          <svg viewBox="0 0 80 80" class="size-20 -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r="34" stroke="#eceef4" stroke-width="7" fill="none" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#2b6fe6"
              stroke-width="7"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="`${(ringCircumference * elapsedSeconds) / TARGET_SECONDS} ${ringCircumference}`"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-base font-semibold tabular">0:{{ elapsedSeconds }}</span>
            <span class="text-[11px] text-ink-muted">/ {{ TARGET_SECONDS }} s</span>
          </div>
        </div>
        <div class="w-48">
          <p class="text-sm font-semibold">{{ answered }} réponses sur {{ total }}</p>
          <UiProgress class="mt-2" :value="(answered / total) * 100" label="Progression du check-in" />
          <p class="mt-1.5 flex justify-between text-xs text-ink-muted">
            Temps moyen : 64 s
            <NuxtLink to="/equipage/check-in/historique" class="font-semibold text-primary hover:underline">
              Historique
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <!-- Symptoms -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <fieldset
        v-for="question in SYMPTOMS"
        :key="question.id"
        class="rounded-2xl border border-divider bg-surface p-5 shadow-card"
      >
        <legend class="sr-only">{{ question.label }}</legend>
        <div class="flex items-center justify-between" aria-hidden="true">
          <span class="flex items-center gap-2.5 font-semibold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <component :is="question.icon" :size="17" :stroke-width="1.7" />
            </span>
            {{ question.label }}
          </span>
          <CircleCheck v-if="symptoms[question.id] !== null" :size="18" class="text-nominal-ink" />
        </div>
        <p v-if="question.hint" class="mt-1.5 text-xs text-ink-muted">{{ question.hint }}</p>
        <div class="mt-4 grid grid-cols-4 gap-2" role="radiogroup" :aria-label="question.label">
          <button
            v-for="(option, index) in SEVERITY_OPTIONS"
            :key="option"
            type="button"
            role="radio"
            :aria-checked="symptoms[question.id] === index"
            class="h-11 rounded-lg border text-sm font-medium transition-colors"
            :class="
              symptoms[question.id] === index
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-line text-ink hover:bg-subtle'
            "
            @click="symptoms[question.id] = index"
          >
            {{ option }}
          </button>
        </div>
      </fieldset>
    </div>

    <!-- Scales -->
    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="scale in SCALES"
        :key="scale.id"
        class="rounded-2xl border border-divider bg-surface p-5 shadow-card"
      >
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2.5 font-semibold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <component :is="scale.icon" :size="17" :stroke-width="1.7" aria-hidden="true" />
            </span>
            {{ scale.label }}
          </span>
          <span class="font-semibold tabular">{{ formatScale(scales[scale.id]) }} / 10</span>
        </div>
        <UiSlider
          v-model="scales[scale.id]"
          class="mt-3"
          :step="0.5"
          :label="scale.label"
          :value-text="`${formatScale(scales[scale.id])} sur 10`"
        />
        <div class="flex justify-between text-xs text-ink-muted">
          <span>{{ scale.low }}</span><span>{{ scale.high }}</span>
        </div>
      </div>
    </div>

    <!-- Note and submission -->
    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
        <div class="flex items-center justify-between">
          <label for="checkin-note" class="flex items-center gap-2.5 font-semibold">
            <MessageSquare :size="18" class="text-ink-muted" aria-hidden="true" />
            Note pour le médecin de bord <span class="font-normal text-ink-muted">(facultatif)</span>
          </label>
          <UiButton variant="ghost" size="sm" :icon="Mic">Dicter</UiButton>
        </div>
        <textarea
          id="checkin-note"
          v-model="note"
          rows="3"
          placeholder="Ajouter un commentaire…"
          class="mt-3 w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div
        class="flex flex-col gap-3 rounded-2xl border p-5"
        :class="sansSignal ? 'border-warning/50 bg-warning-soft' : 'border-divider bg-surface shadow-card'"
      >
        <p v-if="sansSignal" class="flex items-center gap-2 font-semibold">
          <TriangleAlert :size="18" class="text-warning-ink" aria-hidden="true" /> Signal SANS détecté
        </p>
        <p v-if="sansSignal" class="text-sm">
          Vision modifiée + maux de tête répétés : un test visuel guidé vous sera proposé et le CMO sera
          prévenu.
        </p>
        <UiButton class="mt-auto" block :icon="Check" to="/equipage">Valider mon check-in</UiButton>
      </div>
    </div>
  </div>
</template>
