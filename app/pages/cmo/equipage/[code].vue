<script setup lang="ts">
import { Activity, BellRing, ChevronRight, ListChecks, Sparkles } from 'lucide-vue-next'
import { DOMAIN_KEYS, DOMAINS } from '~/constants/domains'
import { LEVEL_STYLES } from '~/constants/levels'
import { levelFromScore } from '~/utils/health'

/**
 * Page M-03 : dossier d'un astronaute vu par le médecin de bord (cahier des charges F9.3).
 * Tout vient du moteur IA en direct : statut, scores par domaine et leurs facteurs,
 * dernières mesures, alertes et protocoles. La page se rafraîchit toutes les 5 s pendant la démo.
 */
definePageMeta({
  layout: 'app',
  validate: (route) => useMissionData().findCrew(String(route.params.code)) !== undefined,
})

const route = useRoute()
const { t } = useI18n()
const { findCrew, mission } = useMissionData()
const code = computed(() => String(route.params.code))
const member = computed(() => findCrew(code.value)!)
const { record, live } = await useCrewRecordScreen(code)

useHead({ title: () => t('Dossier {name}', { name: `${member.value.firstName} ${member.value.lastName}` }) })

const RUN_STATUS: Record<string, string> = {
  in_progress: 'En cours',
  completed: 'Terminé',
  aborted: 'Interrompu',
}

let poller: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (live.value) poller = setInterval(() => refreshNuxtData(crewRecordKey(code.value)), 5000)
})
onBeforeUnmount(() => clearInterval(poller))
</script>

<template>
  <div class="space-y-5">
    <nav :aria-label="t('Fil d’Ariane')" class="flex items-center gap-1.5 text-sm text-ink-muted">
      <NuxtLink to="/cmo" class="hover:text-ink">{{ t('Équipage') }}</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span class="font-medium text-ink" aria-current="page"
        >{{ member.firstName }} {{ member.lastName }}</span
      >
    </nav>

    <!-- Identité et statut calculé par le moteur IA -->
    <section
      class="flex flex-wrap items-center gap-6 rounded-2xl border border-divider bg-surface p-6 shadow-card"
    >
      <UiAvatar :initials="member.initials" :tone="member.tone" :size="80" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-[28px] font-semibold">{{ member.firstName }} {{ member.lastName }}</h1>
          <UiStatusBadge
            :level="record.level"
            size="md"
            :label="`${LEVEL_STYLES[record.level].label} · ${record.score}`"
          />
        </div>
        <p class="mt-0.5 text-sm text-ink-muted">
          {{ member.code }} · {{ t(member.role) }} · {{ t('jour {n} de mission', { n: mission.day }) }}
        </p>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-3">
      <div class="space-y-5">
        <UiCard :title="t('Scores par domaine')" :icon="Activity">
          <ul class="space-y-3">
            <li v-for="key in DOMAIN_KEYS" :key="key">
              <div class="flex items-center gap-2 text-sm">
                <component
                  :is="DOMAINS[key].icon"
                  :size="16"
                  :stroke-width="1.7"
                  class="text-ink-muted"
                  aria-hidden="true"
                />
                <span class="flex-1 font-medium">{{ t(DOMAINS[key].short) }}</span>
                <span class="w-8 text-right font-semibold tabular">{{ record.domains[key] ?? 0 }}</span>
                <UiStatusBadge :level="levelFromScore(record.domains[key] ?? 0)" />
              </div>
              <UiProgress
                class="mt-1.5"
                :value="record.domains[key] ?? 0"
                :height="5"
                :bar-class="LEVEL_STYLES[levelFromScore(record.domains[key] ?? 0)].bar"
                :label="t('Score {domain}', { domain: t(DOMAINS[key].short) })"
              />
            </li>
          </ul>
        </UiCard>

        <UiCard v-if="record.factors.length" :title="t('Pourquoi ce statut')" :icon="Sparkles">
          <ul class="space-y-1.5 text-sm">
            <li v-for="factor in record.factors" :key="factor">{{ factor }}</li>
          </ul>
        </UiCard>
      </div>

      <UiCard :title="t('Dernières mesures')" :icon="Activity" :padded="false">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-y border-divider text-left text-xs text-ink-muted">
              <th scope="col" class="px-5 py-2 font-medium">{{ t('Mesure') }}</th>
              <th scope="col" class="px-2 py-2 font-medium">{{ t('Valeur') }}</th>
              <th scope="col" class="px-2 py-2 font-medium">{{ t('Tendance') }}</th>
              <th scope="col" class="px-5 py-2">
                <span class="sr-only">{{ t('Statut') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in record.vitals" :key="row.id" class="border-b border-divider last:border-0">
              <th scope="row" class="px-5 py-2.5 text-left font-semibold">{{ t(row.label) }}</th>
              <td class="px-2 py-2.5 tabular">{{ row.value }} {{ row.unit }}</td>
              <td class="px-2 py-2.5 text-ink-muted tabular">{{ row.trend }}</td>
              <td class="px-5 py-2.5 text-right"><UiStatusBadge :level="row.level" /></td>
            </tr>
          </tbody>
        </table>
      </UiCard>

      <div class="space-y-5">
        <UiCard :title="t('Alertes')" :icon="BellRing">
          <p v-if="record.alerts.length === 0" class="text-sm text-ink-muted">
            {{ t('Aucune alerte pour cet astronaute.') }}
          </p>
          <ul v-else class="space-y-2.5">
            <li
              v-for="alert in record.alerts"
              :key="alert.id"
              class="rounded-xl border border-divider p-3"
              :class="alert.status === 'resolved' ? 'opacity-60' : ''"
            >
              <div class="flex items-center justify-between gap-2">
                <UiStatusBadge :level="alert.level" />
                <span class="text-xs text-ink-muted">{{ alert.since }}</span>
              </div>
              <p class="mt-1.5 text-sm font-semibold">{{ t(alert.title) }}</p>
              <p class="mt-0.5 text-xs text-ink-muted">{{ t(alert.detail) }}</p>
              <p v-if="alert.protocol" class="mt-1 font-mono text-xs text-primary">→ {{ alert.protocol }}</p>
            </li>
          </ul>
        </UiCard>

        <UiCard :title="t('Protocoles exécutés')" :icon="ListChecks">
          <p v-if="record.runs.length === 0" class="text-sm text-ink-muted">
            {{ t('Aucun protocole lancé.') }}
          </p>
          <ul v-else class="space-y-2.5">
            <li
              v-for="run in record.runs"
              :key="run.id"
              class="flex items-center gap-3 rounded-xl border border-divider p-3"
            >
              <span class="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <ListChecks :size="16" aria-hidden="true" />
              </span>
              <span class="flex-1 text-sm">
                <span class="block font-mono text-xs font-semibold">{{ run.code }}</span>
                <span class="block text-xs text-ink-muted">{{
                  t(RUN_STATUS[run.status] ?? run.status)
                }}</span>
              </span>
              <span
                v-if="run.efficacy !== null"
                class="text-sm font-semibold tabular"
                :class="run.efficacy >= 0.8 ? 'text-nominal-ink' : 'text-warning-ink'"
              >
                {{ Math.round(run.efficacy * 100) }} %
              </span>
            </li>
          </ul>
        </UiCard>
      </div>
    </div>
  </div>
</template>
