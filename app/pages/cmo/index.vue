<script setup lang="ts">
import { Check, CheckCheck, Download, Search } from 'lucide-vue-next'
import { DOMAINS } from '~/constants/domains'
import { chartColor, LEVEL_HEX, LEVEL_STYLES } from '~/constants/levels'
import type { Alert, AlertStatus, Level } from '~/types/domain'

/**
 * Pages M-01 / M-02 : vue d'ensemble du médecin de bord (F9, Figma « M-01/M-02 »).
 * Grille de l'équipage avec leur statut, puis la file d'alertes triée par gravité (F9.2) :
 * recherche, filtre par astronaute, vue actives / acquittées / toutes, acquittement et
 * résolution. Les données se rafraîchissent toutes les 8 s pendant la démo en direct.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Médecin de bord') })

const demo = useMissionData()
const state = useMissionState()
const { updateAlert, live } = useActions()

// Données réactives : elles suivent chaque rechargement de la mission.
const crew = computed(() => state.value.crew ?? demo.crew)
const findCrew = (code: string) => crew.value.find((m) => m.code === code)
// En démo, les acquittements restent locaux (pas de serveur pour les enregistrer).
const localStatus = ref<Record<number, AlertStatus>>({})
const alerts = computed<Alert[]>(() =>
  (state.value.alerts ?? demo.alerts).map((a) => ({ ...a, status: localStatus.value[a.id] ?? a.status })),
)

const view = ref<'active' | 'acknowledged' | 'all'>('active')
const query = ref('')
const member = ref('all')
const VIEWS = computed(() => [
  {
    value: 'active',
    label: t('Actives · {n}', { n: alerts.value.filter((a) => a.status === 'open').length }),
  },
  { value: 'acknowledged', label: t('Acquittées') },
  { value: 'all', label: t('Toutes') },
])

const filtered = computed(() => {
  const words = query.value.trim().toLowerCase()
  return alerts.value.filter(
    (a) =>
      (view.value === 'all' ||
        (view.value === 'active' && a.status === 'open') ||
        (view.value === 'acknowledged' && a.status === 'acknowledged')) &&
      (member.value === 'all' || a.crew === member.value) &&
      (!words || `${a.title} ${a.detail} ${a.crew} ${a.protocol ?? ''}`.toLowerCase().includes(words)),
  )
})

interface AlertGroup {
  title: string
  level: Level
  rows: Alert[]
}
const groups = computed<AlertGroup[]>(() =>
  [
    {
      title: t('Critiques'),
      level: 'critical' as Level,
      rows: filtered.value.filter((a) => a.level === 'critical' && a.status !== 'resolved'),
    },
    {
      title: t('Vigilance'),
      level: 'warning' as Level,
      rows: filtered.value.filter((a) => a.level === 'warning' && a.status !== 'resolved'),
    },
    {
      title: t('Informations'),
      level: 'info' as Level,
      rows: filtered.value.filter((a) => a.level === 'info' && a.status !== 'resolved'),
    },
    {
      title: t('Résolues'),
      level: 'nominal' as Level,
      rows: filtered.value.filter((a) => a.status === 'resolved'),
    },
  ].filter((group) => group.rows.length > 0),
)

const COLUMNS = ['Membre', 'Gravité', 'Domaine', 'Protocole', 'Depuis', 'Suivi']

const busy = ref<number | null>(null)
const error = ref<string | null>(null)
async function setStatus(alert: Alert, status: 'acknowledged' | 'resolved') {
  busy.value = alert.id
  error.value = null
  try {
    const saved = await updateAlert(alert.id, status)
    if (!saved) localStatus.value = { ...localStatus.value, [alert.id]: status }
  } catch (e) {
    error.value = t((e as Error).message)
  } finally {
    busy.value = null
  }
}

/** Export CSV de la file d'alertes affichée (pour le rapport au flight surgeon). */
function exportAlerts() {
  downloadFile(
    'alertes-equipage.csv',
    toCsv([
      ['Astronaute', 'Gravité', 'Domaine', 'Alerte', 'Détail', 'Protocole', 'Depuis', 'Statut'],
      ...filtered.value.map((a) => [
        a.crew,
        LEVEL_STYLES[a.level].label,
        a.domainLabel ?? DOMAINS[a.domain].short,
        a.title,
        a.detail,
        a.protocol,
        a.since,
        a.status,
      ]),
    ]),
  )
}

let poller: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (live()) poller = setInterval(() => loadMissionData(), 8000)
})
onBeforeUnmount(() => clearInterval(poller))
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Médecin de bord')"
      :subtitle="t('Vue d’ensemble de l’équipage et des alertes à traiter')"
    >
      <template #actions>
        <UiButton variant="secondary" size="sm" :icon="Download" @click="exportAlerts">
          {{ t('Exporter les alertes (CSV)') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <!-- Grille de l'équipage (F9.1) -->
    <section :aria-label="t('Équipage')" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="m in crew"
        :key="m.code"
        :to="`/cmo/equipage/${m.code}`"
        class="rounded-2xl border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
        :class="m.level === 'critical' ? 'border-critical/50 bg-critical-soft/30' : 'border-divider'"
      >
        <div class="flex items-center gap-3">
          <UiAvatar :initials="m.initials" :tone="m.tone" :size="42" />
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ m.firstName }} {{ m.lastName }}</p>
            <p class="truncate text-xs text-ink-muted">{{ m.code }} · {{ t(m.role) }}</p>
          </div>
        </div>
        <div class="mt-5 flex items-end justify-between gap-3">
          <div>
            <p class="text-xs text-ink-muted">{{ t('Score global') }}</p>
            <p class="font-display text-3xl font-semibold tabular" :style="{ color: chartColor(m.level) }">
              {{ m.score }}
            </p>
          </div>
          <UiStatusBadge :level="m.level" />
        </div>
        <UiProgress
          class="mt-3"
          :value="m.score"
          :height="6"
          :bar-class="LEVEL_STYLES[m.level].bar"
          :label="t('Score global de {name}', { name: m.firstName })"
        />
        <p class="mt-3 truncate text-xs text-ink-muted">
          {{ m.topAlert ? t(m.topAlert) : t('Aucune alerte active') }}
        </p>
      </NuxtLink>
    </section>

    <!-- Barre d'outils de la file d'alertes -->
    <div id="alertes" class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-56 flex-1">
        <Search
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label for="alert-search" class="sr-only">{{ t('Rechercher une alerte') }}</label>
        <input
          id="alert-search"
          v-model="query"
          type="search"
          :placeholder="t('Rechercher une alerte, un protocole…')"
          class="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>
      <label for="alert-member" class="sr-only">{{ t('Astronaute') }}</label>
      <select
        id="alert-member"
        v-model="member"
        class="h-10 rounded-xl border border-line bg-surface px-3 text-sm"
      >
        <option value="all">{{ t('Tout l’équipage') }}</option>
        <option v-for="m in crew" :key="m.code" :value="m.code">{{ m.code }} · {{ m.firstName }}</option>
      </select>
      <UiSegmented v-model="view" :options="VIEWS" size="sm" :label="t('Afficher')" />
    </div>

    <p v-if="error" class="rounded-lg bg-critical-soft px-4 py-2 text-sm text-critical-ink" role="alert">
      {{ error }}
    </p>

    <!-- File d'alertes (F9.2) -->
    <UiCard v-if="groups.length === 0">
      <p class="py-10 text-center text-sm text-ink-muted">
        {{ t('Aucune alerte ne correspond à ces filtres.') }}
      </p>
    </UiCard>
    <BoardGroup
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :count="t(group.rows.length > 1 ? '{n} alertes' : '{n} alerte', { n: group.rows.length })"
      :color="LEVEL_HEX[group.level]"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th scope="col" class="px-5 py-3 text-left font-medium">{{ t('Alerte') }}</th>
          <th v-for="column in COLUMNS" :key="column" scope="col" class="px-3 py-3 text-center font-medium">
            {{ t(column) }}
          </th>
          <th scope="col" class="px-4 py-3 text-right font-medium">{{ t('Action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alert in group.rows" :key="alert.id" class="border-b border-divider last:border-0">
          <th scope="row" class="px-5 py-3 text-left font-medium">
            {{ t(alert.title) }} <span class="font-normal text-ink-muted">· {{ t(alert.detail) }}</span>
          </th>
          <td class="px-3 py-2 text-center">
            <NuxtLink
              v-if="findCrew(alert.crew)"
              :to="`/cmo/equipage/${alert.crew}`"
              class="inline-flex"
              :aria-label="t('Dossier {code}', { code: alert.crew })"
            >
              <UiAvatar
                :initials="findCrew(alert.crew)!.initials"
                :tone="findCrew(alert.crew)!.tone"
                :size="28"
              />
            </NuxtLink>
          </td>
          <td class="w-40 px-1 py-1">
            <BoardStatusCell :level="alert.status === 'resolved' ? 'nominal' : alert.level" />
          </td>
          <td class="px-3 py-2 text-center">{{ t(alert.domainLabel ?? DOMAINS[alert.domain].short) }}</td>
          <td class="px-3 py-2 text-center font-mono text-xs">
            <NuxtLink
              v-if="alert.protocol"
              :to="`/equipage/protocoles/${alert.protocol}`"
              class="text-primary hover:underline"
            >
              {{ alert.protocol }}
            </NuxtLink>
            <span v-else>—</span>
          </td>
          <td class="px-3 py-2 text-center whitespace-nowrap text-ink-muted">{{ alert.since }}</td>
          <td class="px-3 py-2 text-center">
            <span v-if="alert.assignee" class="text-xs font-medium">{{ alert.assignee }}</span>
            <span v-else class="text-xs text-ink-faint">{{ t('Non assignée') }}</span>
          </td>
          <td class="px-4 py-2 text-right whitespace-nowrap">
            <UiButton
              v-if="alert.status === 'open'"
              size="sm"
              variant="secondary"
              :icon="Check"
              :disabled="busy === alert.id"
              @click="setStatus(alert, 'acknowledged')"
            >
              {{ t('Acquitter') }}
            </UiButton>
            <UiButton
              v-else-if="alert.status === 'acknowledged'"
              size="sm"
              variant="ghost"
              :icon="CheckCheck"
              :disabled="busy === alert.id"
              @click="setStatus(alert, 'resolved')"
            >
              {{ t('Résoudre') }}
            </UiButton>
            <span v-else class="text-xs text-nominal-ink">{{ t('Résolue') }}</span>
          </td>
        </tr>
      </tbody>
    </BoardGroup>
  </div>
</template>
