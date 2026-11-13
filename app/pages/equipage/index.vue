<script setup lang="ts">
import {
  Activity,
  ClipboardCheck,
  Cpu,
  Droplet,
  Dumbbell,
  Eye,
  HeartPulse,
  ListChecks,
  Play,
  Smile,
  Sun,
  Thermometer,
  TriangleAlert,
  Wind,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { LEVEL_HEX } from '~/constants/levels'

/**
 * Page E-01: astronaut home (spec F1). Answers "am I OK?" in under 3 seconds:
 * global status first, then per-system cards, then details on demand.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Tableau de bord' })

const { currentCrew, vitals, hrvWeek, currentExplanation } = useMissionData()

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
const DAY_LABELS = ['J+136', 'J+137', 'J+138', 'J+139', 'J+140', 'J+141', 'Maint.']
</script>

<template>
  <div class="space-y-6">
    <!-- Global status (spec F1.1) -->
    <section
      class="grid items-center gap-6 rounded-2xl border border-warning/40 bg-surface p-6 shadow-card lg:grid-cols-[1.5fr_auto_1fr]"
      style="background-image: linear-gradient(100deg, rgb(253 171 61 / 0.16), transparent 60%)"
      aria-labelledby="global-status"
    >
      <div class="flex gap-5">
        <span class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning-ink">
          <TriangleAlert :size="34" :stroke-width="2" aria-hidden="true" />
        </span>
        <div>
          <p class="text-xs font-semibold tracking-wider text-warning-ink uppercase">
            Statut global · mis à jour il y a 4 s
          </p>
          <h1 id="global-status" class="mt-1 text-2xl font-bold">WARNING — vigilance requise</h1>
          <p class="mt-1.5 max-w-xl text-sm text-ink-muted">
            Votre VFC baisse depuis 3 jours et vous cumulez 5,5 h de dette de sommeil. Le protocole
            <b class="text-ink">PRT-STRESS-01</b> est recommandé.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <UiButton :icon="Play" to="/equipage/protocoles/PRT-STRESS-01">Démarrer le protocole guidé</UiButton>
            <UiButton variant="secondary" :icon="Eye" to="/equipage/systemes/behavioral">
              Voir l’explication IA
            </UiButton>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-1.5">
        <ChartsScoreRing :score="currentCrew.score" />
        <span class="text-xs text-ink-muted">Score de risque global</span>
      </div>
      <div class="lg:border-l lg:border-divider lg:pl-6">
        <p class="mb-1 px-2 text-xs font-semibold tracking-wider text-ink-muted uppercase">Scores par domaine</p>
        <DashboardDomainScores :scores="currentCrew.domains" />
      </div>
    </section>

    <!-- Vital signs (spec F1.2, F1.7) -->
    <section aria-label="Constantes" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <DashboardMetricCard
        v-for="vital in vitals"
        :key="vital.id"
        :icon="VITAL_ICONS[vital.id]!"
        v-bind="vital"
      />
    </section>

    <!-- HRV trend and explanation (spec F1.6, F2.7) -->
    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <UiCard title="Variabilité cardiaque (RMSSD)" :icon="Activity">
        <template #actions>
          <UiSegmented v-model="range" :options="RANGES" size="sm" label="Période" />
        </template>
        <div class="mb-3 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5">
            <i class="h-1 w-4 rounded-full" :style="{ background: LEVEL_HEX.warning }" /> Mesure
          </span>
          <span class="flex items-center gap-1.5">
            <i class="h-0 w-4 border-t-2 border-dashed border-ink-muted" /> Baseline 48 ms
          </span>
          <span class="flex items-center gap-1.5">
            <i class="h-2.5 w-4 rounded-sm bg-nominal/20" /> Plage normale (≥ 80 % de la baseline)
          </span>
        </div>
        <ChartsLineChart
          :values="hrvWeek"
          :color="LEVEL_HEX.warning"
          :height="220"
          :band="[38.4, 62]"
          :baseline="48"
          :min="20"
          :max="65"
          label="VFC sur 7 jours : baisse de 49 à 31 millisecondes, sous la plage normale"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span v-for="day in DAY_LABELS" :key="day">{{ day }}</span>
        </div>
      </UiCard>

      <UiCard title="Pourquoi cette alerte ?" :icon="Cpu">
        <DashboardAlertExplanation v-bind="currentExplanation" />
      </UiCard>
    </div>

    <!-- Systems summary and today's tasks -->
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <UiCard title="Dosimétrie" :icon="Sun">
        <template #actions><UiStatusBadge level="nominal" /></template>
        <p class="font-display text-2xl font-semibold" data-vital>
          86,4 <span class="font-sans text-sm text-ink-muted">mSv mission</span>
        </p>
        <UiProgress class="mt-3" :value="31" bar-class="bg-nominal" label="Dose de carrière" />
        <p class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>Carrière 186 / 600 mSv</span><span>31 %</span>
        </p>
        <NuxtLink to="/equipage/dosimetrie" class="mt-3 text-sm font-semibold text-primary hover:underline">
          Ouvrir la dosimétrie
        </NuxtLink>
      </UiCard>

      <UiCard title="Musculosquelettique" :icon="Dumbbell">
        <template #actions><UiStatusBadge level="nominal" /></template>
        <p class="font-display text-2xl font-semibold" data-vital>
          −1,2 <span class="font-sans text-sm text-ink-muted">% / mois</span>
        </p>
        <p class="text-xs text-ink-muted">Densité osseuse estimée</p>
        <p class="mt-3 flex justify-between text-sm">
          <span class="text-ink-muted">Adhérence exercices</span><span class="font-semibold">71 %</span>
        </p>
        <UiProgress class="mt-1.5" :value="71" bar-class="bg-info" label="Adhérence aux exercices" />
      </UiCard>

      <UiCard title="Comportement" :icon="Smile">
        <template #actions><UiStatusBadge level="warning" /></template>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-ink-muted">Sommeil (nuit)</dt>
            <dd class="font-semibold text-warning-ink">5 h 40</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Stress déclaré</dt>
            <dd class="font-semibold text-warning-ink">7 / 10</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Humeur</dt>
            <dd class="font-semibold">6 / 10</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Vigilance (PVT)</dt>
            <dd class="font-semibold">312 ms</dd>
          </div>
        </dl>
      </UiCard>

      <UiCard title="Aujourd’hui" :icon="ListChecks">
        <ul class="space-y-2">
          <li class="flex items-center gap-3 rounded-lg bg-warning-soft p-3">
            <ClipboardCheck :size="18" class="shrink-0 text-warning-ink" aria-hidden="true" />
            <span class="flex-1 text-sm">
              <b class="block">Check-in quotidien</b>
              <span class="text-xs text-ink-muted">Prévu à 08:00 · en retard</span>
            </span>
            <UiButton size="sm" to="/equipage/check-in">Faire</UiButton>
          </li>
          <li class="flex items-center gap-3 rounded-lg bg-subtle p-3">
            <Dumbbell :size="18" class="shrink-0 text-info-ink" aria-hidden="true" />
            <span class="flex-1 text-sm">
              <b class="block">Exercice ARED</b>
              <span class="text-xs text-ink-muted">Séance 2 / 3 · 16:30</span>
            </span>
          </li>
          <li class="flex items-center gap-3 rounded-lg bg-subtle p-3">
            <Droplet :size="18" class="shrink-0 text-info-ink" aria-hidden="true" />
            <span class="flex-1 text-sm">
              <b class="block">Hydratation</b>
              <span class="text-xs text-ink-muted">1,4 / 2,5 L</span>
            </span>
            <UiButton size="sm" variant="secondary">+250 ml</UiButton>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
