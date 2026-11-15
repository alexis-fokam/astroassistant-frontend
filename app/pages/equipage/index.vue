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
  Sparkles,
  Sun,
  Thermometer,
  Timer,
  Wind,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { chartColor, LEVEL_HEX } from '~/constants/levels'

/**
 * Page E-01 : accueil de l'astronaute (F1, Figma « E-01 »).
 * Répond à « est-ce que je vais bien ? » en moins de 3 secondes : statut global calculé
 * par le moteur IA, cartes par système, puis le détail à la demande.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Tableau de bord') })

const { currentCrew, mission, vitals, hrvWeek, alerts } = useMissionData()

const VITAL_ICONS: Record<string, Component> = {
  heart_rate: HeartPulse,
  hrv_rmssd: Activity,
  blood_pressure: HeartPulse,
  spo2: Wind,
  temperature: Thermometer,
  dose_rate: Sun,
}

// Alerte la plus grave encore ouverte pour l'astronaute : elle fixe le message principal.
const ownAlert = computed(() => {
  const mine = alerts.filter((a) => a.crew === currentCrew.code && a.status !== 'resolved')
  return mine.find((a) => a.level === 'critical') ?? mine.find((a) => a.level === 'warning') ?? null
})
const level = computed(() => ownAlert.value?.level ?? currentCrew.level)
const STATUS_BACKGROUND: Record<string, string> = {
  critical: 'border-critical/50 bg-[linear-gradient(100deg,#fde8ec_0%,#fff6f7_55%,#ffffff_100%)]',
  warning: 'border-warning/50 bg-[linear-gradient(100deg,#fff3e0_0%,#fffaf3_55%,#ffffff_100%)]',
  info: 'border-info/40 bg-[linear-gradient(100deg,#e5f4fe_0%,#f6fbff_55%,#ffffff_100%)]',
  nominal: 'border-nominal/40 bg-[linear-gradient(100deg,#e3f8ee_0%,#f6fdf9_55%,#ffffff_100%)]',
}

// VFC : 84 points sur 7 jours (un toutes les 2 h) ; « 24 h » garde les 12 derniers.
const range = ref<'24h' | '7d'>('7d')
const RANGES = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
]
const hrvShown = computed(() => (range.value === '24h' ? hrvWeek.slice(-12) : hrvWeek))
const hrvLabels = computed(() => hoursAgoLabels(hrvShown.value.length, 2, t))

// Tâches du jour : l'hydratation se compte ici, les autres mènent à leur écran.
const water = ref(1.4)
const WATER_GOAL = 2.5
const TASKS = computed(() => [
  {
    icon: ClipboardCheck,
    title: 'Check-in quotidien',
    detail: 'Prévu à 08:00 · en retard',
    action: 'Faire · 90 s',
    to: '/equipage/check-in',
    primary: true,
    done: false,
  },
  {
    icon: Dumbbell,
    title: 'Exercice ARED',
    detail: 'Séance 2 sur 3 · 16:30',
    action: 'Voir',
    to: '/equipage/systemes/musculoskeletal',
    done: false,
  },
  {
    icon: Droplet,
    title: 'Hydratation',
    detail: `${water.value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} L / ${WATER_GOAL.toLocaleString('fr-FR')} L`,
    action: '+250 ml',
    to: undefined,
    done: water.value >= WATER_GOAL,
  },
  {
    icon: Timer,
    title: 'Test de vigilance',
    detail: 'Avant l’EVA de demain',
    action: 'Lancer',
    to: '/equipage/pvt',
    done: false,
  },
])
const doneCount = computed(() => TASKS.value.filter((task) => task.done).length)
function addWater() {
  water.value = Math.min(WATER_GOAL + 1, Math.round((water.value + 0.25) * 100) / 100)
}

/** Rapport du jour : les dernières constantes, en CSV. */
function exportDay() {
  downloadFile(
    `constantes-${currentCrew.code}-J${mission.day}.csv`,
    toCsv([
      ['Mesure', 'Valeur', 'Unité', 'Statut', 'Tendance'],
      ...vitals.map((v) => [v.label, v.value, v.unit, v.level, v.trend]),
    ]),
  )
}
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Bonjour {name} 👋', { name: currentCrew.firstName })"
      :subtitle="t('Jour {day} de la mission {mission}', { day: mission.day, mission: mission.name })"
    >
      <template #actions>
        <UiButton variant="secondary" size="sm" :icon="FileText" @click="exportDay">{{
          t('Rapport du jour (CSV)')
        }}</UiButton>
      </template>
    </UiPageHeader>

    <!-- Statut global (F1.1), calculé par le moteur IA -->
    <section
      class="grid items-center gap-8 rounded-2xl border p-6 lg:grid-cols-[1.6fr_auto_1fr] lg:p-8"
      :class="STATUS_BACKGROUND[level]"
      aria-labelledby="global-status"
    >
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <UiStatusBadge :level="level" size="md" />
          <span v-if="ownAlert" class="text-xs text-ink-muted">{{
            t('Détecté par le moteur IA embarqué')
          }}</span>
        </div>
        <h2 id="global-status" class="mt-4 text-[26px] leading-tight font-semibold">
          {{ ownAlert ? t(ownAlert.title) : t('Tous vos indicateurs sont dans votre plage habituelle') }}
        </h2>
        <p class="mt-2 max-w-xl text-[15px] text-ink-muted">
          {{
            ownAlert
              ? t(ownAlert.detail)
              : t(
                  'Le moteur IA compare chaque mesure à votre propre référence. Rien à signaler pour l’instant.',
                )
          }}
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <UiButton v-if="ownAlert?.protocol" :icon="Play" :to="`/equipage/protocoles/${ownAlert.protocol}`">
            {{ t('Démarrer {code}', { code: ownAlert.protocol }) }}
          </UiButton>
          <UiButton
            v-if="ownAlert"
            variant="ai"
            :icon="Sparkles"
            :to="`/equipage/systemes/${ownAlert.domain}`"
          >
            {{ t('Pourquoi cette alerte ?') }}
          </UiButton>
        </div>
      </div>
      <ChartsScoreRing :score="currentCrew.score" :size="168" :stroke="16" :caption="t('score de risque')" />
      <div class="lg:border-l lg:border-divider lg:pl-6">
        <p class="mb-1 px-2 text-[11px] font-semibold tracking-wider text-accent uppercase">
          {{ t('Scores par domaine') }}
        </p>
        <DashboardDomainScores :scores="currentCrew.domains" />
      </div>
    </section>

    <!-- Vital signs (spec F1.2, F1.7) -->
    <section :aria-label="t('Constantes')" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
      <UiCard :title="t('Variabilité cardiaque')" :subtitle="t('RMSSD en millisecondes')" :icon="Activity">
        <template #actions>
          <UiSegmented v-model="range" :options="RANGES" size="sm" :label="t('Période')" />
        </template>
        <div class="mb-3 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5">
            <i class="h-1 w-4 rounded-full" :style="{ background: LEVEL_HEX.warning }" /> {{ t('Mesure') }}
          </span>
          <span class="flex items-center gap-1.5">
            <i class="w-4 border-t-2 border-dashed border-ink-faint" /> {{ t('Votre référence · 48 ms') }}
          </span>
          <span class="flex items-center gap-1.5"
            ><i class="h-2.5 w-4 rounded-sm bg-nominal/20" /> {{ t('Zone normale') }}</span
          >
        </div>
        <ChartsLineChart
          :values="hrvShown"
          :color="LEVEL_HEX.warning"
          :height="230"
          :band="[38.4, 62]"
          :baseline="48"
          :min="20"
          :max="65"
          unit="ms"
          :digits="0"
          :x-labels="hrvLabels"
          :label="t('Variabilité cardiaque (RMSSD) sur la période, comparée à votre référence de 48 ms')"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>{{ t(range === '24h' ? 'Il y a 24 h' : 'Il y a 7 j') }}</span><span>{{
            t('Maintenant')
          }}</span>
        </div>
      </UiCard>

      <UiCard :title="t('À faire aujourd’hui')" :icon="ListChecks">
        <template #actions>
          <span class="text-xs text-ink-muted">{{
            t('{n} sur {total} faits', { n: doneCount, total: TASKS.length })
          }}</span>
        </template>
        <ul class="space-y-3">
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
              <span class="block text-sm font-semibold">{{ t(task.title) }}</span>
              <span class="block text-xs text-ink-muted">{{ t(task.detail) }}</span>
            </span>
            <UiButton
              v-if="task.to"
              size="sm"
              :variant="task.primary ? 'primary' : 'secondary'"
              :to="task.to"
            >
              {{ t(task.action) }}
            </UiButton>
            <UiButton v-else size="sm" variant="secondary" :disabled="task.done" @click="addWater">
              {{ t(task.done ? 'Objectif atteint' : task.action) }}
            </UiButton>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
