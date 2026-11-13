<script setup lang="ts">
import {
  Activity,
  CalendarDays,
  Check,
  CircleCheck,
  Dumbbell,
  ListChecks,
  Plus,
  Timer,
  TriangleAlert,
  X,
} from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import type { ChartSeries } from '~/types/charts'

/**
 * Page E-12: countermeasure exercise (spec F6, Figma "E-12 · Exercices de contre-mesure").
 * Weekly plan, adherence, missed-session alert with a catch-up plan (F6.3, scenario S5).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Exercices de contre-mesure' })

type Session = 'done' | 'missed' | 'today' | 'today-planned' | 'planned'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const TODAY_INDEX = 5

const WEEK: { label: string; sessions: Session[] }[] = [
  { label: 'ARED · résistance', sessions: ['done', 'done', 'missed', 'missed', 'done', 'today', 'planned'] },
  { label: 'T2 · tapis', sessions: ['done', 'done', 'done', 'done', 'missed', 'today', 'planned'] },
  { label: 'CEVIS · vélo', sessions: ['done', 'missed', 'done', 'done', 'done', 'today-planned', 'planned'] },
]

const CELL_CLASSES: Record<Session, string> = {
  done: 'bg-nominal text-ink',
  missed: 'border border-warning bg-warning-soft text-warning-ink',
  today: 'bg-primary text-white',
  'today-planned': 'border border-dashed border-primary text-xs font-semibold text-primary',
  planned: 'border border-divider bg-subtle',
}
const CELL_LABELS: Record<Session, string> = {
  done: 'réalisée',
  missed: 'manquée',
  today: 'réalisée aujourd’hui',
  'today-planned': 'prévue à 16:30',
  planned: 'planifiée',
}

const CATCH_UP = [
  { label: 'J+143 · ARED 30 min à 70 %', done: true },
  { label: 'J+144 · ARED 40 min à 80 %', done: false },
  { label: 'J+145 · ARED 45 min + T2 20 min', done: false },
  { label: 'J+146-147 · retour au planning', done: false },
]

// Estimated bone density change (%), then two projections to J+200 (spec F6.2).
const measured = Array.from({ length: 48 }, (_, i) => -(5.7 * i) / 47)
const BONE_SERIES: ChartSeries[] = [
  { values: measured, color: '#2f86eb' },
  {
    values: Array.from({ length: 20 }, (_, i) => -5.7 - i * 0.13),
    color: LEVEL_HEX.warning,
    dashed: true,
    offset: 47,
  },
  {
    values: Array.from({ length: 20 }, (_, i) => -5.7 - i * 0.04),
    color: LEVEL_HEX.nominal,
    dashed: true,
    offset: 47,
  },
]

const TODAY_SESSIONS = [
  { time: '08:30', name: 'ARED · résistance', detail: '45 min · élevée · FC moy 128', done: true },
  { time: '13:00', name: 'T2 · tapis harnaché', detail: '30 min · modérée · FC moy 141', done: true },
  { time: '16:30', name: 'CEVIS · vélo', detail: '30 min · intervalles', done: false },
]
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Exercices de contre-mesure"
      subtitle="La microgravité impose un entraînement quotidien pour limiter la perte osseuse et musculaire"
    >
      <template #actions><UiButton :icon="Plus">Saisir une séance</UiButton></template>
    </UiPageHeader>

    <section aria-label="Indicateurs" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard
        label="Adhérence 7 j"
        :icon="Activity"
        value="71"
        unit="%"
        sub="15 séances sur 21"
        level="warning"
      />
      <DashboardKpiCard label="Minutes" :icon="Timer" value="412" unit="min" sub="Objectif 630 min" />
      <DashboardKpiCard
        label="Manquées"
        :icon="TriangleAlert"
        value="2"
        unit="consécutives"
        sub="ARED mer. et jeu."
        level="warning"
      />
      <DashboardKpiCard
        label="Perte osseuse projetée"
        :icon="Dumbbell"
        value="−8,1"
        unit="%"
        sub="vs −6,4 % à 100 %"
      />
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard title="Cette semaine" :icon="CalendarDays">
        <table class="w-full border-separate border-spacing-1.5 text-sm">
          <thead>
            <tr>
              <th scope="col"><span class="sr-only">Activité</span></th>
              <th
                v-for="(day, index) in DAYS"
                :key="day"
                scope="col"
                class="pb-1 text-xs font-medium"
                :class="index === TODAY_INDEX ? 'text-primary' : 'text-ink-muted'"
              >
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in WEEK" :key="row.label">
              <th scope="row" class="pr-2 text-left font-medium whitespace-nowrap">{{ row.label }}</th>
              <td v-for="(session, index) in row.sessions" :key="index">
                <span
                  class="flex h-10 items-center justify-center rounded-lg"
                  :class="CELL_CLASSES[session]"
                  :aria-label="`${DAYS[index]} : ${CELL_LABELS[session]}`"
                >
                  <Check
                    v-if="session === 'done' || session === 'today'"
                    :size="16"
                    :stroke-width="2.5"
                    aria-hidden="true"
                  />
                  <X v-else-if="session === 'missed'" :size="16" :stroke-width="2.5" aria-hidden="true" />
                  <template v-else-if="session === 'today-planned'">16:30</template>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-nominal" /> Réalisée</span
          >
          <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-warning" /> Manquée</span>
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-primary" /> Aujourd’hui</span
          >
          <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-line" /> Planifiée</span>
        </div>
      </UiCard>

      <section
        class="flex flex-col rounded-2xl border border-warning/50 bg-warning-soft p-5"
        aria-labelledby="catch-up"
      >
        <h2 id="catch-up" class="flex items-center gap-2 font-semibold">
          <TriangleAlert :size="18" class="text-warning-ink" aria-hidden="true" /> Plan de rattrapage proposé
        </h2>
        <p class="mt-2 text-sm">
          2 séances ARED manquées : projection osseuse aggravée de 1,7 point. Plan progressif sur 5 jours
          (PRT-EX-03).
        </p>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="step in CATCH_UP" :key="step.label" class="flex items-center gap-2">
            <component
              :is="step.done ? CircleCheck : Timer"
              :size="16"
              :class="step.done ? 'text-nominal-ink' : 'text-ink-muted'"
              :aria-label="step.done ? 'Fait' : 'À venir'"
            />
            {{ step.label }}
          </li>
        </ul>
        <div class="mt-auto flex gap-2 pt-4">
          <UiButton class="flex-1" :icon="Check" to="/equipage/protocoles/PRT-EX-03"
            >Accepter le plan</UiButton
          >
          <UiButton variant="secondary">Reporter</UiButton>
        </div>
      </section>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard title="Densité osseuse estimée" subtitle="Calibré OSDR : 1 à 1,5 % par mois" :icon="Activity">
        <div class="mb-3 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-brand-blue" /> Estimation</span
          >
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-warning" /> Adhérence actuelle</span
          >
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-nominal" /> 100 % d’adhérence</span
          >
        </div>
        <ChartsMultiLineChart
          :series="BONE_SERIES"
          :min="-9"
          :max="0.5"
          :height="190"
          label="Densité osseuse estimée en baisse de 5,7 %, projetée à −8,1 % avec l’adhérence actuelle et −6,4 % à 100 %"
        />
        <div class="mt-2 flex justify-between text-xs text-ink-muted">
          <span>J+0</span><span>J+50</span><span>J+100</span><span>Aujourd’hui · −5,7 %</span
          ><span>Fin J+200</span>
        </div>
      </UiCard>

      <UiCard title="Séances du jour" :icon="ListChecks">
        <ul class="space-y-2.5">
          <li
            v-for="session in TODAY_SESSIONS"
            :key="session.time"
            class="flex items-center gap-4 rounded-xl border border-divider p-3"
          >
            <span class="w-11 font-semibold tabular">{{ session.time }}</span>
            <span class="flex-1 text-sm">
              <span class="block font-semibold">{{ session.name }}</span>
              <span class="block text-xs text-ink-muted">{{ session.detail }}</span>
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="session.done ? 'bg-subtle text-ink-muted' : 'bg-info-soft text-info-ink'"
            >
              {{ session.done ? 'Terminée' : 'À venir' }}
            </span>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
