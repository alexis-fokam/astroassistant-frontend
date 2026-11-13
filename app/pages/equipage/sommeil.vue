<script setup lang="ts">
import { Activity, ListChecks, Moon, OctagonAlert, Plus, Sun, Timer } from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import type { Level } from '~/types/domain'
import type { ChartSeries, ChartZone } from '~/types/charts'

/**
 * Page E-13: sleep, circadian rhythm and fatigue (spec F7, Figma "E-13 · Sommeil & fatigue").
 * Sleep score and debt (F7.1), suggested light/dark plan (F7.2), predictive fatigue (F7.3).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Sommeil & fatigue' })

// Sleep duration over 14 nights (hours) and the 7 h target.
const NIGHTS = [7.2, 6.9, 7.4, 6.5, 7.0, 6.8, 7.1, 6.2, 6.6, 5.9, 6.1, 5.4, 5.6, 5.7]
const TARGET_HOURS = 7
const nightColors = NIGHTS.map((hours) =>
  hours >= TARGET_HOURS ? LEVEL_HEX.nominal : hours >= 5.5 ? LEVEL_HEX.warning : LEVEL_HEX.critical,
)

const RECENT_NIGHTS: {
  night: string
  hours: string
  duration: string
  wakeups: number
  score: number
  level: Level
}[] = [
  { night: 'J+142', hours: '23:10 → 04:50', duration: '5 h 40', wakeups: 4, score: 58, level: 'warning' },
  { night: 'J+141', hours: '23:40 → 05:15', duration: '5 h 35', wakeups: 5, score: 54, level: 'warning' },
  { night: 'J+140', hours: '22:55 → 04:20', duration: '5 h 25', wakeups: 6, score: 41, level: 'critical' },
  { night: 'J+139', hours: '23:05 → 05:10', duration: '6 h 05', wakeups: 3, score: 63, level: 'warning' },
]

// Suggested 24 h plan, positions in hours (spec F7.2).
const DAY_PLAN = [
  { label: 'Sommeil', from: 0, to: 5.67, classes: 'bg-info-soft text-info-ink' },
  { label: 'Lumière vive', from: 6, to: 8, classes: 'border border-info bg-surface text-info-ink' },
  { label: 'Prép. EVA', from: 9.5, to: 13.5, classes: 'bg-warning-soft text-warning-ink' },
  { label: 'Obscurité', from: 22, to: 23.4, classes: 'bg-ink text-white' },
  { label: '', from: 23.4, to: 24, classes: 'bg-info-soft' },
]
const NOW_HOURS = 14 + 5 / 60
const toPercent = (hours: number) => `${(hours / 24) * 100}%`

// Predicted fatigue over the next 24 h (0-100) with risk zones; EVA at +19 h (spec F7.3).
const fatigue = Array.from({ length: 48 }, (_, i) => {
  const base = 45 + 32 * Math.sin(((i - 4) / 48) * 2 * Math.PI)
  return Math.round(base + (i >= 30 && i <= 38 ? 12 : 0) - (i > 38 ? 10 : 0))
})
const FATIGUE_SERIES: ChartSeries[] = [{ values: fatigue, color: '#9b5cf2' }]
const FATIGUE_ZONES: ChartZone[] = [
  { from: 70, to: 100, color: LEVEL_HEX.critical, opacity: 0.08 },
  { from: 55, to: 70, color: LEVEL_HEX.warning, opacity: 0.1 },
]
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Sommeil & fatigue"
      subtitle="Seize levers de soleil par jour perturbent l’horloge interne : Astro vous aide à la recaler"
    >
      <template #actions><UiButton variant="secondary" :icon="Plus">Saisir une nuit</UiButton></template>
    </UiPageHeader>

    <section aria-label="Indicateurs" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard
        label="Score sommeil"
        :icon="Moon"
        value="58"
        unit="/ 100"
        sub="Durée, régularité, réveils"
        level="warning"
      />
      <DashboardKpiCard label="Dernière nuit" :icon="Moon" value="5 h 40" sub="4 réveils" level="warning" />
      <DashboardKpiCard
        label="Dette cumulée"
        :icon="Timer"
        value="5,5"
        unit="h"
        sub="Seuil WARNING > 4 h"
        level="warning"
      />
      <DashboardKpiCard
        label="Désalignement"
        :icon="Sun"
        value="1 h 50"
        sub="vs rythme cible"
        level="warning"
      />
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard title="Durée de sommeil · 14 nuits" :icon="Moon">
        <div class="mb-4 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-nominal" /> ≥ 7 h</span>
          <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-warning" /> 5,5-7 h</span>
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-critical" /> &lt; 5,5 h</span
          >
          <span>Objectif 7 h</span>
        </div>
        <ChartsBarChart
          :values="NIGHTS"
          :max="8"
          :colors="nightColors"
          :reference="TARGET_HOURS"
          :height="150"
          label="Durée de sommeil des 14 dernières nuits, de 7,2 h à 5,7 h, sous l’objectif de 7 h depuis 8 nuits"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>J+129</span><span>J+132</span><span>J+135</span><span>J+138</span><span>J+142</span>
        </div>
      </UiCard>

      <UiCard title="Nuits récentes" :icon="ListChecks" :padded="false">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-divider text-left text-xs text-ink-muted">
              <th scope="col" class="px-5 py-2 font-medium">Nuit</th>
              <th scope="col" class="px-2 py-2 font-medium">Horaires</th>
              <th scope="col" class="px-2 py-2 font-medium">Durée</th>
              <th scope="col" class="px-2 py-2 font-medium">Réveils</th>
              <th scope="col" class="px-5 py-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="night in RECENT_NIGHTS"
              :key="night.night"
              class="border-b border-divider last:border-0"
            >
              <th scope="row" class="px-5 py-3 text-left font-semibold">{{ night.night }}</th>
              <td class="px-2 py-3 whitespace-nowrap tabular">{{ night.hours }}</td>
              <td class="px-2 py-3 whitespace-nowrap tabular">{{ night.duration }}</td>
              <td class="px-2 py-3 tabular">{{ night.wakeups }}</td>
              <td class="px-5 py-3"><UiStatusBadge :level="night.level" :label="String(night.score)" /></td>
            </tr>
          </tbody>
        </table>
      </UiCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <UiCard title="Planning circadien suggéré" :icon="Sun">
        <div
          class="relative h-12 rounded-lg bg-subtle"
          role="img"
          aria-label="Sommeil de minuit à 5 h 40, lumière vive de 6 h à 8 h, préparation EVA de 9 h 30 à 13 h 30, obscurité à 22 h"
        >
          <span
            v-for="block in DAY_PLAN"
            :key="`${block.label}-${block.from}`"
            class="absolute inset-y-1.5 flex items-center justify-center overflow-hidden rounded-md text-xs font-medium whitespace-nowrap"
            :class="block.classes"
            :style="{ left: toPercent(block.from), width: toPercent(block.to - block.from) }"
          >
            {{ block.label }}
          </span>
          <span class="absolute -inset-y-2 w-0.5 bg-brand-violet" :style="{ left: toPercent(NOW_HOURS) }">
            <span class="absolute -top-4 -left-4 text-[10px] font-semibold text-brand-violet">14:05</span>
          </span>
        </div>
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
        <ul class="mt-4 space-y-2 text-sm">
          <li class="flex items-center gap-2">
            <Sun :size="15" class="text-info-ink" aria-hidden="true" />
            <span><b>06:00-08:00</b> lumière vive pour avancer la phase</span>
          </li>
          <li class="flex items-center gap-2">
            <Moon :size="15" class="text-ink-muted" aria-hidden="true" />
            <span><b>21:30</b> obscurité · coucher à 22:45</span>
          </li>
        </ul>
      </UiCard>

      <UiCard title="Modèle de fatigue · 24 prochaines heures" :icon="Activity">
        <ChartsMultiLineChart
          :series="FATIGUE_SERIES"
          :zones="FATIGUE_ZONES"
          :markers="[{ index: 38, color: LEVEL_HEX.critical }]"
          :min="0"
          :max="100"
          :height="140"
          :grid="false"
          label="Fatigue prédite sur 24 heures, au plus haut pendant l’EVA de demain à 9 h"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>Maint.</span><span>+6 h</span><span>+12 h</span><span>+18 h</span><span>+24 h</span>
        </div>
        <p class="mt-4 flex items-start gap-2.5 rounded-xl bg-critical-soft p-3 text-sm">
          <OctagonAlert :size="17" class="mt-0.5 shrink-0 text-critical-ink" aria-hidden="true" />
          <span>
            <b class="block">Créneau à risque : EVA demain 09:00</b>
            <span class="text-ink-muted"
              >Fatigue prédite 82/100 · proposer un décalage ou une sieste de 30 min à 07:00</span
            >
          </span>
        </p>
      </UiCard>
    </div>
  </div>
</template>
