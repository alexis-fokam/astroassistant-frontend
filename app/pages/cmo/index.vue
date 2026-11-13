<script setup lang="ts">
import {
  ArrowUpDown,
  EyeOff,
  FileText,
  Filter,
  LayoutList,
  LockOpen,
  MessageSquare,
  Plus,
  Search,
  UserRound,
} from 'lucide-vue-next'
import { DOMAINS } from '~/constants/domains'
import { chartColor, LEVEL_HEX } from '~/constants/levels'
import type { Alert, Level } from '~/types/domain'
import { buildSeries } from '~/utils/series'

/**
 * Pages M-01 / M-02: Crew Medical Officer overview (spec F9, Figma "M-01/M-02 · Médecin de bord").
 * Crew grid with status, then the alert queue sorted by severity and age (F9.2).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Médecin de bord' })

const { crew, alerts, findCrew } = useMissionData()

const view = ref('active')
const VIEWS = [
  { value: 'active', label: 'Actives · 5' },
  { value: 'acknowledged', label: 'Acquittées' },
  { value: 'all', label: 'Toutes' },
]

interface AlertGroup {
  title: string
  level: Level
  rows: Alert[]
}

const groups = computed<AlertGroup[]>(() => [
  {
    title: 'Critiques',
    level: 'critical',
    rows: alerts.filter((a) => a.level === 'critical' && a.status !== 'resolved'),
  },
  {
    title: 'Vigilance',
    level: 'warning',
    rows: alerts.filter((a) => a.level === 'warning' && a.status !== 'resolved'),
  },
  { title: 'Résolues', level: 'nominal', rows: alerts.filter((a) => a.status === 'resolved') },
])

const COLUMNS = ['Membre', 'Gravité', 'Domaine', 'Protocole', 'Depuis', 'Suivi']

const trends = Object.fromEntries(
  crew.map((member, i) => [member.code, buildSeries(24, member.score, { noise: 4, seed: 60 + i })]),
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">Médecin de bord</h1>
        <p class="mt-0.5 text-sm text-ink-muted">Vue d’ensemble de l’équipage et des alertes à traiter</p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="flex items-center gap-1.5 rounded-full bg-nominal-soft px-3 py-1.5 text-xs font-medium text-nominal-ink"
        >
          <LockOpen :size="14" aria-hidden="true" /> Profil CMO déverrouillé · 14 min
        </span>
        <UiButton variant="secondary" size="sm" :icon="FileText">Rapport hebdo</UiButton>
      </div>
    </div>

    <!-- Crew grid (spec F9.1) -->
    <section aria-label="Équipage" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="member in crew"
        :key="member.code"
        :to="`/cmo/equipage/${member.code}`"
        class="rounded-2xl border bg-surface p-5 shadow-card transition-shadow hover:shadow-raised"
        :class="member.level === 'critical' ? 'border-critical/50 bg-critical-soft/30' : 'border-divider'"
      >
        <div class="flex items-center gap-3">
          <UiAvatar :initials="member.initials" :tone="member.tone" :size="40" />
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ member.firstName }} {{ member.lastName }}</p>
            <p class="truncate text-xs text-ink-muted">{{ member.code }} · {{ member.role }}</p>
          </div>
        </div>
        <div class="mt-4 flex items-end justify-between gap-3">
          <div>
            <p class="text-xs text-ink-muted">Score global</p>
            <p
              class="font-display text-3xl font-semibold tabular"
              :style="{ color: chartColor(member.level) }"
            >
              {{ member.score }}
            </p>
          </div>
          <ChartsLineChart
            class="max-w-28"
            :values="trends[member.code]!"
            :color="LEVEL_HEX[member.level]"
            :height="40"
            :grid="false"
            :fill="false"
            :min="0"
            :max="100"
            :label="`Tendance du score de ${member.firstName}`"
          />
        </div>
        <div class="mt-3 flex items-center gap-2">
          <UiStatusBadge :level="member.level" />
          <span class="truncate text-xs text-ink-muted">{{ member.topAlert ?? 'Aucune alerte active' }}</span>
        </div>
      </NuxtLink>
    </section>

    <!-- Board toolbar -->
    <div id="alertes" class="flex flex-wrap items-center gap-1">
      <UiButton size="sm" :icon="Plus">Nouvelle note</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Search">Rechercher</UiButton>
      <UiButton variant="ghost" size="sm" :icon="UserRound">Membre</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Filter">Filtrer</UiButton>
      <UiButton variant="ghost" size="sm" :icon="ArrowUpDown">Trier</UiButton>
      <UiButton variant="ghost" size="sm" :icon="EyeOff">Masquer</UiButton>
      <UiButton variant="ghost" size="sm" :icon="LayoutList">Grouper par</UiButton>
      <UiSegmented v-model="view" class="ml-auto" :options="VIEWS" size="sm" label="Afficher" />
    </div>

    <!-- Alert queue (spec F9.2) -->
    <BoardGroup
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :count="`${group.rows.length} alerte${group.rows.length > 1 ? 's' : ''}`"
      :color="LEVEL_HEX[group.level]"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th scope="col" class="px-4 py-2.5 text-left font-medium">Alerte</th>
          <th scope="col" class="w-10"><span class="sr-only">Commentaires</span></th>
          <th v-for="column in COLUMNS" :key="column" scope="col" class="px-3 py-2.5 text-center font-medium">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alert in group.rows" :key="alert.id" class="border-b border-divider">
          <th scope="row" class="px-4 py-2 text-left font-medium">{{ alert.title }} · {{ alert.detail }}</th>
          <td class="text-center">
            <button
              type="button"
              class="rounded-md p-1.5 text-ink-muted hover:bg-subtle"
              :aria-label="`Commenter l’alerte ${alert.title}`"
            >
              <MessageSquare :size="17" :stroke-width="1.7" aria-hidden="true" />
            </button>
          </td>
          <td class="px-3 py-2 text-center">
            <NuxtLink
              :to="`/cmo/equipage/${alert.crew}`"
              class="inline-flex"
              :aria-label="`Dossier ${alert.crew}`"
            >
              <UiAvatar
                :initials="findCrew(alert.crew)!.initials"
                :tone="findCrew(alert.crew)!.tone"
                :size="28"
              />
            </NuxtLink>
          </td>
          <td class="w-40 px-1 py-1">
            <BoardStatusCell :level="group.level === 'nominal' ? 'nominal' : alert.level" />
          </td>
          <td class="px-3 py-2 text-center">{{ alert.domainLabel ?? DOMAINS[alert.domain].short }}</td>
          <td class="px-3 py-2 text-center font-mono text-xs">{{ alert.protocol ?? '—' }}</td>
          <td class="px-3 py-2 text-center text-ink-muted">{{ alert.since }}</td>
          <td class="px-3 py-2 text-center">
            <UiAvatar
              v-if="alert.assignee"
              :initials="findCrew(alert.assignee)!.initials"
              :tone="4"
              :size="26"
            />
            <UserRound v-else :size="20" class="mx-auto text-ink-faint" aria-label="Non assignée" />
          </td>
        </tr>
        <tr>
          <td colspan="8" class="px-4 py-2.5 text-sm text-ink-faint">
            <button type="button" class="hover:text-ink">+ Ajouter une note</button>
          </td>
        </tr>
      </tbody>
      <template #summary>
        <div class="mt-1.5 flex justify-center">
          <span class="h-2.5 w-40 rounded-sm" :style="{ background: LEVEL_HEX[group.level] }" />
        </div>
      </template>
    </BoardGroup>
  </div>
</template>
