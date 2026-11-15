<script setup lang="ts">
import {
  CalendarDays,
  Download,
  FileText,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
} from 'lucide-vue-next'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'

/**
 * Pages M-09 / M-10 : journal d'audit et rapports (F14, Figma « M-09/M-10 »).
 * Chaque entrée garde l'empreinte SHA-256 de la précédente : rien ne peut être modifié.
 * Le journal se filtre et s'exporte en CSV ; le rapport d'un astronaute vient de
 * GET /reports/{code} et se télécharge en CSV ou JSON.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Journal & rapports') })

const { crew, mission } = useMissionData()
const { api } = useApi()
const { live } = useActions()
const { auditLog, auditSummary } = await useAuditScreen()

// ------------------------------------------------------------------ journal
const query = ref('')
const level = ref<'all' | Level>('all')
const LEVELS: { value: 'all' | Level; label: string }[] = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'critical', label: 'Critique' },
  { value: 'warning', label: 'Vigilance' },
  { value: 'info', label: 'Information' },
  { value: 'nominal', label: 'Nominal' },
]
const entries = computed(() =>
  auditLog.value
    .filter(
      (entry) =>
        (level.value === 'all' || entry.level === level.value) &&
        `${entry.actor} ${entry.action} ${entry.object}`
          .toLowerCase()
          .includes(query.value.trim().toLowerCase()),
    )
    .map((entry) => ({ ...entry, icon: LEVEL_STYLES[entry.level].icon, ink: LEVEL_STYLES[entry.level].ink })),
)
const chainBroken = computed(() => auditSummary.value.verifiedAt === 'chaîne rompue !')

const verifying = ref(false)
async function reverify() {
  verifying.value = true
  await refreshNuxtData('screen-audit')
  verifying.value = false
}

function exportLog() {
  downloadFile(
    'journal-audit.csv',
    toCsv([
      ['Horodatage', 'Acteur', 'Niveau', 'Action', 'Objet', 'Empreinte'],
      ...entries.value.map((e) => [e.at, e.actor, LEVEL_STYLES[e.level].label, e.action, e.object, e.hash]),
    ]),
  )
}

// ------------------------------------------------------------------ rapport
interface Report {
  crew_id: string
  period_start: string
  period_end: string
  status: string | null
  global_score: number | null
  sleep_hours_avg: number | null
  exercise_completed: number
  exercise_missed: number
  pvt_median_rt_ms: number | null
  pvt_lapses: number
  checkins: number
  dose_received_msv: number
  alerts: Record<string, number>
}

const reportCrew = ref(crew[1]?.code ?? crew[0]!.code)
const period = ref<'day' | 'week' | 'month'>('week')
const PERIODS = [
  { value: 'day', label: t('Jour') },
  { value: 'week', label: t('Semaine') },
  { value: 'month', label: t('Mois') },
]
const format = ref<'csv' | 'json'>('csv')
const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
]

const report = ref<Report | null>(null)
const reportError = ref<string | null>(null)
async function loadReport() {
  reportError.value = null
  if (!live()) {
    report.value = null
    return
  }
  try {
    report.value = await api<Report>(`/reports/${reportCrew.value}`, { query: { period: period.value } })
  } catch (e) {
    report.value = null
    reportError.value = t((e as Error).message)
  }
}
watch([reportCrew, period], loadReport)
onMounted(loadReport)

const fmt = (value: number | null | undefined, digits = 1, unit = '') =>
  value === null || value === undefined
    ? '—'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${unit}`
const adherence = computed(() => {
  const r = report.value
  if (!r) return null
  const total = r.exercise_completed + r.exercise_missed
  return total ? Math.round((r.exercise_completed / total) * 100) : null
})
const alertCount = computed(() => Object.values(report.value?.alerts ?? {}).reduce((sum, n) => sum + n, 0))

function downloadReport() {
  const r = report.value
  if (!r) return
  const name = `rapport-${r.crew_id}-${period.value}`
  if (format.value === 'json') {
    downloadFile(`${name}.json`, JSON.stringify(r, null, 2), 'application/json')
    return
  }
  downloadFile(
    `${name}.csv`,
    toCsv([
      ['Indicateur', 'Valeur'],
      ['Astronaute', r.crew_id],
      ['Début', r.period_start],
      ['Fin', r.period_end],
      ['Statut', r.status],
      ['Score global', r.global_score],
      ['Sommeil moyen (h)', r.sleep_hours_avg],
      ['Séances faites', r.exercise_completed],
      ['Séances manquées', r.exercise_missed],
      ['PVT médian (ms)', r.pvt_median_rt_ms],
      ['Inattentions PVT', r.pvt_lapses],
      ['Check-ins', r.checkins],
      ['Dose reçue (mSv)', r.dose_received_msv],
      ...Object.entries(r.alerts).map(([lvl, n]) => [`Alertes ${lvl}`, n]),
    ]),
  )
}
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Journal & rapports')"
      :subtitle="t('Traçabilité complète des alertes, décisions et protocoles (F14)')"
    />

    <section
      class="flex flex-wrap items-center gap-4 rounded-2xl border p-6"
      :class="chainBroken ? 'border-critical/40 bg-critical-soft' : 'border-nominal/40 bg-nominal-soft'"
      role="status"
    >
      <component
        :is="chainBroken ? ShieldX : ShieldCheck"
        :size="26"
        :class="chainBroken ? 'text-critical-ink' : 'text-nominal-ink'"
        aria-hidden="true"
      />
      <div class="flex-1">
        <p class="font-semibold" :class="chainBroken ? 'text-critical-ink' : 'text-nominal-ink'">
          {{
            chainBroken
              ? t('Chaîne d’audit rompue : une entrée a été modifiée')
              : t('Intégrité de la chaîne vérifiée à {time}', { time: auditSummary.verifiedAt })
          }}
        </p>
        <p class="text-sm text-ink-muted">
          {{
            t(
              '{n} entrées · chaque entrée contient l’empreinte SHA-256 de la précédente · aucune modification possible',
              {
                n: auditSummary.entries,
              },
            )
          }}
        </p>
      </div>
      <UiButton variant="secondary" size="sm" :icon="RefreshCw" :disabled="verifying" @click="reverify">
        {{ t(verifying ? 'Vérification…' : 'Revérifier') }}
      </UiButton>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard :title="t('Journal d’audit')" :icon="Shield">
        <template #actions>
          <UiButton variant="ghost" size="sm" :icon="Download" @click="exportLog">CSV</UiButton>
        </template>
        <div class="flex flex-wrap gap-3">
          <label class="relative min-w-60 flex-1">
            <span class="sr-only">{{ t('Rechercher dans le journal') }}</span>
            <Search
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              v-model="query"
              type="search"
              :placeholder="t('Rechercher une action, un acteur…')"
              class="h-10 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </label>
          <label class="sr-only" for="audit-level">{{ t('Niveau') }}</label>
          <select
            id="audit-level"
            v-model="level"
            class="h-10 rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option v-for="option in LEVELS" :key="option.value" :value="option.value">
              {{ t(option.label) }}
            </option>
          </select>
          <span class="flex items-center gap-1.5 rounded-full bg-subtle px-3 text-sm">
            <CalendarDays :size="14" aria-hidden="true" /> J+{{ mission.day }}
          </span>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-divider text-left text-xs text-ink-muted">
                <th scope="col" class="py-2.5 pr-3 font-medium">{{ t('Horodatage') }}</th>
                <th scope="col" class="px-3 py-2.5 font-medium">{{ t('Acteur') }}</th>
                <th scope="col" class="py-2.5">
                  <span class="sr-only">{{ t('Niveau') }}</span>
                </th>
                <th scope="col" class="px-3 py-2.5 font-medium">{{ t('Action') }}</th>
                <th scope="col" class="px-3 py-2.5 font-medium">{{ t('Objet') }}</th>
                <th scope="col" class="py-2.5 pl-3 font-medium">{{ t('Empreinte') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="entries.length === 0">
                <td colspan="6" class="py-10 text-center text-ink-muted">
                  {{ t('Aucune entrée ne correspond.') }}
                </td>
              </tr>
              <tr
                v-for="entry in entries"
                :key="entry.hash + entry.at"
                class="border-b border-divider last:border-0"
              >
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

      <UiCard :title="t('Rapport d’un astronaute')" :icon="FileText">
        <div class="space-y-5">
          <label class="block">
            <span class="text-sm font-semibold">{{ t('Astronaute') }}</span>
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
            <p class="text-sm font-semibold">{{ t('Période') }}</p>
            <UiSegmented
              v-model="period"
              class="mt-1.5 w-full"
              :options="PERIODS"
              :label="t('Période du rapport')"
            />
          </div>

          <div v-if="report" class="rounded-xl border border-divider bg-subtle p-4 text-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 font-semibold"
                ><BrandMark :size="20" /> {{ report.crew_id }}</span
              >
              <UiStatusBadge v-if="report.status" :level="report.status as Level" />
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              <dt class="text-ink-muted">{{ t('Score global') }}</dt>
              <dd class="text-right font-semibold tabular">{{ fmt(report.global_score, 0) }}</dd>
              <dt class="text-ink-muted">{{ t('Alertes') }}</dt>
              <dd class="text-right font-semibold tabular">{{ alertCount }}</dd>
              <dt class="text-ink-muted">{{ t('Sommeil moyen') }}</dt>
              <dd class="text-right font-semibold tabular">{{ fmt(report.sleep_hours_avg, 1, ' h') }}</dd>
              <dt class="text-ink-muted">{{ t('Assiduité exercice') }}</dt>
              <dd class="text-right font-semibold tabular">
                {{ adherence === null ? '—' : `${adherence} %` }}
              </dd>
              <dt class="text-ink-muted">{{ t('Dose reçue') }}</dt>
              <dd class="text-right font-semibold tabular">{{ fmt(report.dose_received_msv, 2, ' mSv') }}</dd>
              <dt class="text-ink-muted">{{ t('Check-ins') }}</dt>
              <dd class="text-right font-semibold tabular">{{ report.checkins }}</dd>
            </dl>
          </div>
          <p
            v-else-if="reportError"
            class="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical-ink"
            role="alert"
          >
            {{ reportError }}
          </p>
          <p v-else class="rounded-xl bg-subtle p-4 text-sm text-ink-muted">
            {{
              t(
                'Le rapport se calcule à partir des données du serveur : connectez-vous au backend pour le générer.',
              )
            }}
          </p>

          <div>
            <p class="text-sm font-semibold">{{ t('Format') }}</p>
            <UiSegmented
              v-model="format"
              class="mt-1.5 w-full"
              :options="FORMATS"
              :label="t('Format du rapport')"
            />
          </div>
          <UiButton block :icon="Download" :disabled="!report" @click="downloadReport">
            {{ t('Télécharger le rapport') }}
          </UiButton>
        </div>
      </UiCard>
    </div>
  </div>
</template>
