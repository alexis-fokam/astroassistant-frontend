<script setup lang="ts">
import {
  Activity,
  ClipboardCheck,
  Droplet,
  Dumbbell,
  FileText,
  HeartPulse,
  ListChecks,
  Play,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Thermometer,
  Timer,
  Wind,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { chartColor, LEVEL_HEX } from '~/constants/levels'

/**
 * Page E-01: astronaut home (spec F1, Figma "E-01 · Tableau de bord astronaute").
 * Answers "am I OK?" in under 3 seconds: global status first, then per-system
 * cards, then details on demand.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Tableau de bord' })

const { currentCrew, mission, vitals, hrvWeek } = useMissionData()

const VITAL_ICONS: Record<string, Component> = {
  heart_rate: HeartPulse,
  hrv_rmssd: Activity,
  blood_pressure: HeartPulse,
  spo2: Wind,
  temperature: Thermometer,
  dose_rate: Sun,
}

const range = ref('7d')
const RANGES = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: 'mission', label: 'Mission' },
]
const DAY_LABELS = ['J+135', 'J+136', 'J+137', 'J+138', 'J+139', 'J+140', 'J+141', 'Aujourd’hui']

const TASKS = [
  {
    icon: ClipboardCheck,
    title: 'Check-in quotidien',
    detail: 'Prévu à 08:00 · en retard',
    action: 'Faire · 90 s',
    to: '/equipage/check-in',
    primary: true,
  },
  {
    icon: Dumbbell,
    title: 'Exercice ARED',
    detail: 'Séance 2 sur 3 · 16:30',
    action: 'Voir',
    to: '/equipage',
  },
  { icon: Droplet, title: 'Hydratation', detail: '1,4 L sur 2,5 L', action: '+250 ml', to: undefined },
  {
    icon: Timer,
    title: 'Test de vigilance',
    detail: 'Avant l’EVA de demain',
    action: 'Lancer',
    to: '/equipage',
  },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Greeting -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">Bonjour {{ currentCrew.firstName }} 👋</h1>
        <p class="mt-0.5 text-sm text-ink-muted">
          Jour {{ mission.day }} de la mission {{ mission.name }} · dernière mesure il y a 4 s
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton variant="secondary" size="sm" :icon="SlidersHorizontal">Personnaliser</UiButton>
        <UiButton variant="secondary" size="sm" :icon="FileText">Rapport du jour</UiButton>
      </div>
    </div>

    <!-- Global status (spec F1.1) -->
    <section
      class="grid items-center gap-6 rounded-2xl border border-warning/50 p-6 lg:grid-cols-[1.6fr_auto_1fr]"
      style="background-image: linear-gradient(100deg, #fff3e0 0%, #fffaf3 55%, #ffffff 100%)"
      aria-labelledby="global-status"
    >
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <UiStatusBadge level="warning" size="md" label="WARNING · vigilance requise" />
          <span class="text-xs text-ink-muted">Confirmé sur 2 mesures consécutives</span>
        </div>
        <h2 id="global-status" class="mt-4 text-[26px] leading-tight font-semibold">
          Votre récupération est en baisse depuis 3 jours
        </h2>
        <p class="mt-2 max-w-xl text-[15px] text-ink-muted">
          Votre variabilité cardiaque a chuté de 35 % et vous avez accumulé 5,5 h de dette de sommeil. Astro
          vous recommande un protocole de respiration guidée de 9 minutes.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <UiButton :icon="Play" to="/equipage/protocoles/PRT-STRESS-01">Démarrer PRT-STRESS-01</UiButton>
          <UiButton variant="ai" :icon="Sparkles" to="/equipage/systemes/behavioral">
            Pourquoi cette alerte ?
          </UiButton>
        </div>
      </div>
      <ChartsScoreRing :score="currentCrew.score" :size="168" :stroke="16" caption="score de risque" />
      <div class="lg:border-l lg:border-divider lg:pl-6">
        <p class="mb-1 px-2 text-[11px] font-semibold tracking-wider text-accent uppercase">
          Scores par domaine
        </p>
        <DashboardDomainScores :scores="currentCrew.domains" />
      </div>
    </section>

    <!-- Vital signs (spec F1.2, F1.7) -->
    <section aria-label="Constantes" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardMetricCard
        v-for="vital in vitals"
        :key="vital.id"
        :icon="VITAL_ICONS[vital.id]!"
        :color="chartColor(vital.level)"
        v-bind="vital"
      />
    </section>

    <!-- HRV trend (spec F1.6) and today's tasks -->
    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <UiCard title="Variabilité cardiaque" subtitle="RMSSD en millisecondes" :icon="Activity">
        <template #actions>
          <UiSegmented v-model="range" :options="RANGES" size="sm" label="Période" />
        </template>
        <div class="mb-3 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5">
            <i class="h-1 w-4 rounded-full" :style="{ background: LEVEL_HEX.warning }" /> Mesure
          </span>
          <span class="flex items-center gap-1.5">
            <i class="w-4 border-t-2 border-dashed border-ink-faint" /> Votre baseline · 48 ms
          </span>
          <span class="flex items-center gap-1.5"
            ><i class="h-2.5 w-4 rounded-sm bg-nominal/20" /> Zone normale</span
          >
        </div>
        <ChartsLineChart
          :values="hrvWeek"
          :color="LEVEL_HEX.warning"
          :height="230"
          :band="[38.4, 62]"
          :baseline="48"
          :min="20"
          :max="65"
          label="VFC sur 7 jours : baisse de 49 à 31 millisecondes, sous la zone normale"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span v-for="day in DAY_LABELS" :key="day">{{ day }}</span>
        </div>
      </UiCard>

      <UiCard title="À faire aujourd’hui" :icon="ListChecks">
        <template #actions><span class="text-xs text-ink-muted">2 sur 6 faits</span></template>
        <ul class="space-y-2.5">
          <li
            v-for="task in TASKS"
            :key="task.title"
            class="flex items-center gap-3 rounded-xl border border-divider p-3"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-muted"
            >
              <component :is="task.icon" :size="18" :stroke-width="1.7" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold">{{ task.title }}</span>
              <span class="block text-xs text-ink-muted">{{ task.detail }}</span>
            </span>
            <UiButton size="sm" :variant="task.primary ? 'primary' : 'secondary'" :to="task.to">
              {{ task.action }}
            </UiButton>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
