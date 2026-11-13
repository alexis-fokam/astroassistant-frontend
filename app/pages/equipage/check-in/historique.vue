<script setup lang="ts">
import { Bell, CalendarDays, CircleCheck, ClipboardCheck, ListChecks, Timer, Zap } from 'lucide-vue-next'
import type { Level } from '~/types/domain'

/**
 * Page E-06: check-in history (spec F3.5, Figma "E-06 · Historique des check-ins").
 * Streak, average duration, completion rate, reminder time and the last 30 days.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Mes check-ins' })

type DayState = 'on-time' | 'late' | 'missed' | 'today'

// Mission days J+113 to J+142.
const LATE_DAYS = new Set([124, 135, 141])
const MISSED_DAYS = new Set([119, 130])
const days = Array.from({ length: 30 }, (_, i) => {
  const day = 113 + i
  const state: DayState =
    day === 142 ? 'today' : MISSED_DAYS.has(day) ? 'missed' : LATE_DAYS.has(day) ? 'late' : 'on-time'
  return { day, state }
})
const DAY_CLASSES: Record<DayState, string> = {
  'on-time': 'bg-primary text-white',
  late: 'bg-brand-lavender text-ink',
  missed: 'bg-line text-ink-muted',
  today: 'border-2 border-dashed border-primary text-primary',
}
const DAY_LABELS: Record<DayState, string> = {
  'on-time': 'à l’heure',
  late: 'en retard',
  missed: 'oublié',
  today: 'à faire aujourd’hui',
}

const range = ref('7d')
const RANGES = [
  { value: '7d', label: '7 j' },
  { value: '30d', label: '30 j' },
  { value: 'mission', label: 'Mission' },
]

const HISTORY: {
  day: string
  time: string
  duration: string
  feeling: string
  symptoms: string
  level: Level
}[] = [
  {
    day: 'J+141',
    time: '08:04',
    duration: '71 s',
    feeling: 'Stress 7 · sommeil 3,5',
    symptoms: 'Dos, vision',
    level: 'warning',
  },
  {
    day: 'J+140',
    time: '08:12',
    duration: '64 s',
    feeling: 'Stress 6 · sommeil 4',
    symptoms: 'Dos',
    level: 'warning',
  },
  {
    day: 'J+139',
    time: '07:58',
    duration: '58 s',
    feeling: 'Stress 5 · sommeil 5',
    symptoms: '—',
    level: 'nominal',
  },
  {
    day: 'J+138',
    time: '09:41',
    duration: '82 s',
    feeling: 'Stress 5 · sommeil 6',
    symptoms: '—',
    level: 'nominal',
  },
  {
    day: 'J+137',
    time: '08:01',
    duration: '55 s',
    feeling: 'Stress 4 · sommeil 7',
    symptoms: '—',
    level: 'nominal',
  },
]
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Mes check-ins" subtitle="Historique, régularité et rappels">
      <template #actions>
        <UiButton :icon="ClipboardCheck" to="/equipage/check-in">Faire le check-in du jour</UiButton>
      </template>
    </UiPageHeader>

    <section aria-label="Indicateurs" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard label="Série en cours" :icon="Zap" value="4" unit="jours" sub="Record : 21 jours" />
      <DashboardKpiCard label="Durée moyenne" :icon="Timer" value="64" unit="s" sub="Objectif < 90 s" />
      <DashboardKpiCard
        label="Taux de complétion"
        :icon="CircleCheck"
        value="93"
        unit="% · 30 j"
        sub="2 oublis ce mois"
      />
      <DashboardKpiCard label="Rappel quotidien" :icon="Bell" value="08:00" sub="Relance à 09:00 si oublié" />
    </section>

    <div class="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
      <UiCard title="30 derniers jours" :icon="CalendarDays">
        <ol class="grid grid-cols-7 gap-2">
          <li
            v-for="entry in days"
            :key="entry.day"
            class="flex h-11 items-center justify-center rounded-lg text-sm font-semibold tabular"
            :class="DAY_CLASSES[entry.state]"
          >
            <span class="sr-only">Jour</span> {{ entry.day }}
            <span class="sr-only">, {{ DAY_LABELS[entry.state] }}</span>
          </li>
        </ol>
        <div class="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-primary" /> À l’heure</span
          >
          <span class="flex items-center gap-1.5"
            ><i class="h-1 w-4 rounded-full bg-brand-lavender" /> En retard</span
          >
          <span class="flex items-center gap-1.5"><i class="h-1 w-4 rounded-full bg-line" /> Oublié</span>
        </div>
      </UiCard>

      <UiCard title="Historique" :icon="ListChecks" :padded="false">
        <template #actions
          ><UiSegmented v-model="range" :options="RANGES" size="sm" label="Période"
        /></template>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-y border-divider text-left text-xs text-ink-muted">
                <th scope="col" class="px-5 py-2.5 font-medium">Jour</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Heure</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Durée</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Ressenti</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Symptômes</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Impact</th>
                <th scope="col" class="px-5 py-2.5"><span class="sr-only">Détail</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in HISTORY" :key="row.day" class="border-b border-divider last:border-0">
                <th scope="row" class="px-5 py-3.5 text-left font-semibold">{{ row.day }}</th>
                <td class="px-3 py-3.5 tabular">{{ row.time }}</td>
                <td class="px-3 py-3.5 tabular">{{ row.duration }}</td>
                <td class="px-3 py-3.5">{{ row.feeling }}</td>
                <td class="px-3 py-3.5">{{ row.symptoms }}</td>
                <td class="px-3 py-3.5"><UiStatusBadge :level="row.level" /></td>
                <td class="px-5 py-3.5 text-right"><UiButton variant="ghost" size="sm">Voir</UiButton></td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>
  </div>
</template>
