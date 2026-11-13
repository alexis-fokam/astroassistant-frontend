<script setup lang="ts">
import {
  CalendarDays,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
} from 'lucide-vue-next'
import { LEVEL_HEX, LEVEL_STYLES } from '~/constants/levels'
import { AUDIT_LOG, AUDIT_SUMMARY } from '~/mocks/audit'
import { buildSeries } from '~/utils/series'

/**
 * Pages M-09 / M-10: audit trail and reports (spec F14, Figma "M-09/M-10 · Journal d'audit & rapports").
 * Each entry stores the SHA-256 of the previous one; nothing can be modified.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Journal & rapports' })

const { crew } = useMissionData()

const tab = ref('audit')
const TABS = [
  { value: 'audit', label: 'Journal d’audit' },
  { value: 'reports', label: 'Rapports' },
  { value: 'csv', label: 'Exports CSV' },
]

const query = ref('')
const entries = computed(() =>
  AUDIT_LOG.filter((entry) =>
    `${entry.actor} ${entry.action} ${entry.object}`.toLowerCase().includes(query.value.trim().toLowerCase()),
  ).map((entry) => ({ ...entry, icon: LEVEL_STYLES[entry.level].icon, ink: LEVEL_STYLES[entry.level].ink })),
)

const reportCrew = ref('AV-02')
const period = ref('week')
const PERIODS = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'mission', label: 'Mission' },
]
const format = ref('pdf')
const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'json', label: 'JSON' },
]
const reportTrend = buildSeries(28, 62, { noise: 4, drift: -12, seed: 81 })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Journal & rapports"
      subtitle="Traçabilité complète des alertes, décisions et protocoles (F14)"
    >
      <template #actions><UiSegmented v-model="tab" :options="TABS" label="Section" /></template>
    </UiPageHeader>

    <section
      class="flex flex-wrap items-center gap-4 rounded-2xl border border-nominal/40 bg-nominal-soft p-5"
      role="status"
    >
      <ShieldCheck :size="24" class="text-nominal-ink" aria-hidden="true" />
      <div class="flex-1">
        <p class="font-semibold text-nominal-ink">
          Intégrité de la chaîne vérifiée à {{ AUDIT_SUMMARY.verifiedAt }}
        </p>
        <p class="text-sm text-ink-muted">
          {{ AUDIT_SUMMARY.entries }} entrées · chaque entrée contient l’empreinte SHA-256 de la précédente ·
          aucune modification possible
        </p>
      </div>
      <UiButton variant="secondary" size="sm" :icon="RefreshCw">Revérifier</UiButton>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard title="Journal d’audit" :icon="Shield">
        <div class="flex flex-wrap gap-2">
          <label class="relative min-w-60 flex-1">
            <span class="sr-only">Rechercher dans le journal</span>
            <Search
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              v-model="query"
              type="search"
              placeholder="Rechercher une action, un acteur…"
              class="h-10 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </label>
          <UiButton variant="ghost" size="sm" :icon="Filter">Filtrer</UiButton>
          <span class="flex items-center gap-1.5 rounded-full bg-subtle px-3 text-sm">
            <CalendarDays :size="14" aria-hidden="true" /> J+142
          </span>
        </div>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-divider text-left text-xs text-ink-muted">
                <th scope="col" class="py-2 pr-3 font-medium">Horodatage</th>
                <th scope="col" class="px-3 py-2 font-medium">Acteur</th>
                <th scope="col" class="py-2"><span class="sr-only">Niveau</span></th>
                <th scope="col" class="px-3 py-2 font-medium">Action</th>
                <th scope="col" class="px-3 py-2 font-medium">Objet</th>
                <th scope="col" class="py-2 pl-3 font-medium">Empreinte</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in entries" :key="entry.hash" class="border-b border-divider last:border-0">
                <td class="py-3 pr-3 whitespace-nowrap tabular">{{ entry.at }}</td>
                <td class="px-3 py-3 whitespace-nowrap">{{ entry.actor }}</td>
                <td class="py-3">
                  <component :is="entry.icon" :size="16" :class="entry.ink" :aria-label="entry.level" />
                </td>
                <td class="px-3 py-3">
                  <code class="rounded bg-primary-soft px-1.5 py-0.5 text-xs text-primary">{{
                    entry.action
                  }}</code>
                </td>
                <td class="px-3 py-3">{{ entry.object }}</td>
                <td class="py-3 pl-3 font-mono text-xs text-ink-muted">{{ entry.hash }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>

      <UiCard title="Générer un rapport" :icon="FileText">
        <div class="space-y-4">
          <label class="block">
            <span class="text-sm font-semibold">Astronaute</span>
            <select
              v-model="reportCrew"
              class="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-primary"
            >
              <option v-for="member in crew" :key="member.code" :value="member.code">
                {{ member.firstName }} {{ member.lastName }} · {{ member.code }}
              </option>
            </select>
          </label>
          <div>
            <p class="text-sm font-semibold">Période</p>
            <UiSegmented
              v-model="period"
              class="mt-1.5 w-full"
              :options="PERIODS"
              label="Période du rapport"
            />
          </div>
          <div>
            <p class="text-sm font-semibold">Format</p>
            <UiSegmented
              v-model="format"
              class="mt-1.5 w-full"
              :options="FORMATS"
              label="Format du rapport"
            />
          </div>
          <div class="rounded-xl border border-divider bg-subtle p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 font-semibold"
                ><BrandMark :size="20" /> Rapport hebdomadaire</span
              >
              <span class="text-xs text-ink-muted">J+136 → J+142</span>
            </div>
            <div class="mt-2 flex items-center gap-2 text-xs">
              <UiStatusBadge level="warning" label="WARNING dominant" />
              <span class="text-ink-muted">3 alertes · 2 protocoles</span>
            </div>
            <ChartsLineChart
              class="mt-2"
              :values="reportTrend"
              :color="LEVEL_HEX.warning"
              :height="44"
              :grid="false"
              label="Tendance du score sur la semaine"
            />
            <p class="mt-2 text-xs text-ink-muted">Dose +4,2 mSv · adhérence 71 % · sommeil moyen 6 h 05</p>
          </div>
          <UiButton block :icon="Download">Générer le rapport</UiButton>
        </div>
      </UiCard>
    </div>
  </div>
</template>
