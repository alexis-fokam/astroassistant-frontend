<script setup lang="ts">
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Download,
  Dumbbell,
  Moon,
  Sparkles,
} from 'lucide-vue-next'
import type { Level } from '~/types/domain'
import { buildSeries } from '~/utils/series'

/**
 * Page E-03: detail of one metric, heart rate (spec F1.6, Figma "E-03 · Détail d'une métrique (FC)").
 * 24 h series with normal band, exercise highlight, tooltip and zoom.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Fréquence cardiaque' })

const range = ref('24h')
const RANGES = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: 'mission', label: 'Mission' },
]

// One sample every 15 minutes: night rest, daytime activity, ARED session 16:00-17:30.
const heartRate = buildSeries(97, 0, { noise: 2.5, seed: 91 }).map((noise, i) => {
  const hour = i / 4
  const base = hour < 5 ? 54 : hour < 13 ? 54 + (hour - 5) * 2.2 : 68
  const exercise = hour >= 16 && hour <= 17.5 ? 36 : 0
  return Math.round(base + exercise + noise - (hour > 18 ? 12 : 0))
})

const STATS = [
  { label: 'Moyenne', value: '68 bpm' },
  { label: 'Minimum', value: '54 bpm' },
  { label: 'Maximum', value: '112 bpm' },
  { label: 'Votre baseline', value: '66 ± 5' },
  { label: 'Temps en zone normale', value: '94 %' },
]

const EVENTS = [
  {
    icon: Dumbbell,
    tone: 'bg-accent-soft text-accent',
    title: 'Séance ARED · 16:00-17:30',
    text: 'Pic à 112 bpm, attendu pendant l’effort',
  },
  {
    icon: Moon,
    tone: 'bg-info-soft text-info-ink',
    title: 'Sommeil · 23:10-04:50',
    text: 'FC de repos 54 bpm',
  },
  {
    icon: ClipboardCheck,
    tone: 'bg-warning-soft text-warning-ink',
    title: 'Check-in · 08:04',
    text: 'Stress 7/10 déclaré',
  },
]

// Clinical thresholds for resting heart rate (spec §6.2).
function heartRateLevel(value: number): Level {
  if (value < 40 || value > 120) return 'critical'
  if (value < 45 || value > 110) return 'warning'
  return 'nominal'
}
</script>

<template>
  <div class="space-y-6">
    <nav aria-label="Fil d’Ariane" class="flex items-center gap-1.5 text-sm text-ink-muted">
      <NuxtLink to="/equipage/systemes/cardio" class="hover:text-ink">Systèmes</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <NuxtLink to="/equipage/systemes/cardio" class="hover:text-ink">Cardio</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span class="font-medium text-ink" aria-current="page">Fréquence cardiaque</span>
    </nav>

    <UiPageHeader
      title="Fréquence cardiaque"
      subtitle="Mesure continue · capteur thoracique simulé · mise à jour toutes les 5 s"
    >
      <template #actions>
        <UiSegmented v-model="range" :options="RANGES" label="Période" />
        <UiButton variant="secondary" :icon="Download">Exporter CSV</UiButton>
      </template>
    </UiPageHeader>

    <dl class="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <div
        v-for="stat in STATS"
        :key="stat.label"
        class="rounded-2xl border border-divider bg-surface p-4 shadow-card"
      >
        <dt class="text-sm text-ink-muted">{{ stat.label }}</dt>
        <dd class="mt-1 text-lg font-semibold tabular">{{ stat.value }}</dd>
      </div>
    </dl>

    <div class="grid gap-6 lg:grid-cols-[2.3fr_1fr]">
      <section
        class="rounded-2xl border border-divider bg-surface p-5 shadow-card"
        aria-label="Courbe de fréquence cardiaque"
      >
        <ChartsInteractiveChart
          :values="heartRate"
          :min="40"
          :max="120"
          unit="bpm"
          :band="[50, 90]"
          :highlights="[{ from: 16, to: 17.5 }]"
          :y-ticks="[40, 60, 80, 100, 120]"
          :level-of="heartRateLevel"
          label="Fréquence cardiaque sur 24 heures, entre 54 et 112 battements par minute, pic pendant la séance ARED"
        >
          <template #legend>
            <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-brand-blue" /> FC</span>
            <span class="flex items-center gap-1.5"
              ><i class="h-2.5 w-4 rounded-sm bg-nominal/25" /> Zone normale 50-90 bpm</span
            >
            <span class="flex items-center gap-1.5"
              ><i class="h-2.5 w-4 rounded-sm bg-brand-violet/25" /> Exercice</span
            >
          </template>
        </ChartsInteractiveChart>
      </section>

      <div class="space-y-5">
        <UiCard title="Événements de la journée" :icon="CalendarDays">
          <ul class="space-y-2.5">
            <li
              v-for="event in EVENTS"
              :key="event.title"
              class="flex gap-3 rounded-xl border border-divider p-3"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg" :class="event.tone">
                <component :is="event.icon" :size="17" aria-hidden="true" />
              </span>
              <span class="text-sm">
                <span class="block font-semibold">{{ event.title }}</span>
                <span class="block text-xs text-ink-muted">{{ event.text }}</span>
              </span>
            </li>
          </ul>
        </UiCard>
        <p class="flex items-start gap-2.5 rounded-xl bg-accent-soft p-4 text-sm">
          <Sparkles :size="17" class="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          Votre FC de repos est stable. Le pic de 16:00 correspond à votre séance ARED et n’a pas déclenché
          d’alerte.
        </p>
      </div>
    </div>
  </div>
</template>
