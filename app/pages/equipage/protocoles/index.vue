<script setup lang="ts">
import { History, Play, Search, Sparkles } from 'lucide-vue-next'
import { DOMAINS } from '~/constants/domains'
import { LEVEL_HEX } from '~/constants/levels'
import type { RunProgress } from '~/mocks/protocolRuns'

/**
 * Page E-07 : mes protocoles (F4, Figma « E-07 »).
 * Chaque alerte WARNING ou CRITICAL propose au moins un protocole (critère d'acceptation F4).
 * Le bandeau « Recommandé » suit l'alerte ouverte de l'astronaute ; la liste se filtre et
 * se recherche.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Mes protocoles') })

const { protocols, alerts, currentCrew, findProtocol } = useMissionData()
const { runs } = await useProtocolRunsScreen()

const filter = ref<'active' | 'done' | 'all'>('active')
const FILTERS = computed(() => [
  {
    value: 'active',
    label: t('Actifs · {n}', { n: runs.value.filter((r) => r.progress !== 'done').length }),
  },
  { value: 'done', label: t('Terminés') },
  { value: 'all', label: t('Tous') },
])
const query = ref('')
const matches = (run: { title: string; code: string; trigger: string }) =>
  `${run.title} ${run.code} ${run.trigger}`.toLowerCase().includes(query.value.trim().toLowerCase())

const pending = computed(() => runs.value.filter((run) => run.progress !== 'done' && matches(run)))
const done = computed(() => runs.value.filter((run) => run.progress === 'done' && matches(run)))

// Protocole recommandé maintenant : celui de l'alerte ouverte la plus grave de l'astronaute.
const recommended = computed(() => {
  const mine = alerts.filter((a) => a.crew === currentCrew.code && a.status !== 'resolved' && a.protocol)
  const alert = mine.find((a) => a.level === 'critical') ?? mine[0]
  if (!alert) return null
  const protocol = findProtocol(alert.protocol!)
  return {
    code: alert.protocol!,
    title: protocol?.title ?? alert.protocol!,
    minutes: protocol?.minutes ?? null,
    reason: alert.title,
    domain: alert.domain,
  }
})

const PROGRESS: Record<RunProgress, { label: string; classes: string }> = {
  in_progress: { label: 'En cours', classes: 'bg-primary text-white' },
  todo: { label: 'À faire', classes: 'bg-brand-lavender text-ink' },
  done: { label: 'Terminé', classes: 'bg-line text-ink' },
}

const COLUMNS = ['Protocole', 'Déclencheur', 'Gravité', 'Durée', 'Avancement', 'Efficacité']
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Mes protocoles')"
      :subtitle="t('Chaque alerte WARNING ou CRITICAL propose au moins un protocole (F4)')"
    >
      <template #actions>
        <UiButton variant="secondary" size="sm" :icon="History" @click="filter = 'done'">{{
          t('Historique')
        }}</UiButton>
      </template>
    </UiPageHeader>

    <!-- Recommandé maintenant, d'après l'alerte ouverte -->
    <section
      v-if="recommended"
      class="flex flex-wrap items-center gap-5 rounded-2xl border border-brand-lavender/60 p-6 lg:p-8"
      style="background-image: linear-gradient(100deg, #f1eafd 0%, #f5f9ff 60%, #ffffff 100%)"
    >
      <span class="flex size-14 items-center justify-center rounded-2xl bg-ai-gradient text-white">
        <Sparkles :size="26" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          {{ t('Recommandé par le moteur IA · maintenant') }}
        </p>
        <h2 class="mt-1 text-xl font-semibold">{{ t(recommended.title) }}</h2>
        <p class="mt-0.5 text-sm text-ink-muted">
          {{ recommended.code
          }}<template v-if="recommended.minutes"> · {{ recommended.minutes }} min</template> ·
          {{ t('déclenché par : {reason}', { reason: t(recommended.reason) }) }}
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton :icon="Play" :to="`/equipage/protocoles/${recommended.code}`">{{
          t('Ouvrir le protocole')
        }}</UiButton>
        <UiButton variant="secondary" :to="`/equipage/systemes/${recommended.domain}`">{{
          t('Pourquoi ?')
        }}</UiButton>
      </div>
    </section>

    <!-- Recherche et filtre -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-56 flex-1">
        <Search
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label for="run-search" class="sr-only">{{ t('Rechercher un protocole') }}</label>
        <input
          id="run-search"
          v-model="query"
          type="search"
          :placeholder="t('Rechercher un protocole, un déclencheur…')"
          class="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>
      <UiSegmented v-model="filter" :options="FILTERS" size="sm" :label="t('Afficher')" />
    </div>

    <BoardGroup
      v-if="filter !== 'done'"
      title="À suivre"
      :count="`${pending.length} protocoles`"
      :color="LEVEL_HEX.info"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th
            v-for="column in COLUMNS"
            :key="column"
            scope="col"
            class="px-4 py-2.5 text-center font-medium first:text-left"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="run in pending" :key="run.code" class="border-b border-divider last:border-0">
          <th scope="row" class="px-4 py-2 text-left font-normal">
            <NuxtLink :to="`/equipage/protocoles/${run.code}`" class="block hover:text-primary">
              <span class="block font-semibold">{{ run.title }}</span>
              <span class="block text-xs text-ink-muted">{{ run.code }}</span>
            </NuxtLink>
          </th>
          <td class="px-4 py-2 text-center">{{ run.trigger }}</td>
          <td class="w-36 px-1 py-1">
            <BoardStatusCell :level="run.level" />
          </td>
          <td class="px-4 py-2 text-center whitespace-nowrap">{{ run.duration }}</td>
          <td class="w-36 px-1 py-1">
            <span
              class="flex h-9 items-center justify-center rounded-sm text-xs font-semibold"
              :class="PROGRESS[run.progress].classes"
            >
              {{ PROGRESS[run.progress].label }}
            </span>
          </td>
          <td class="px-4 py-2 text-center text-ink-faint">—</td>
        </tr>
      </tbody>
    </BoardGroup>

    <BoardGroup
      v-if="filter !== 'active'"
      title="Terminés"
      :count="`${done.length} protocoles · efficacité réévaluée`"
      color="#676e83"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th
            v-for="column in COLUMNS"
            :key="column"
            scope="col"
            class="px-4 py-2.5 text-center font-medium first:text-left"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(run, index) in done"
          :key="`${run.code}-${index}`"
          class="border-b border-divider last:border-0"
        >
          <th scope="row" class="px-4 py-2 text-left font-normal">
            <span class="block font-semibold">{{ run.title }}</span>
            <span class="block text-xs text-ink-muted">{{ run.code }}</span>
          </th>
          <td class="px-4 py-2 text-center">{{ run.trigger }}</td>
          <td class="w-36 px-1 py-1">
            <BoardStatusCell :level="run.level" />
          </td>
          <td class="px-4 py-2 text-center whitespace-nowrap">{{ run.duration }}</td>
          <td class="w-36 px-1 py-1">
            <span
              class="flex h-9 items-center justify-center rounded-sm text-xs font-semibold"
              :class="PROGRESS.done.classes"
            >
              {{ PROGRESS.done.label }}
            </span>
          </td>
          <td class="w-48 px-4 py-2">
            <span class="flex items-center gap-2">
              <UiProgress
                :value="(run.efficacy ?? 0) * 100"
                :height="6"
                :bar-class="(run.efficacy ?? 0) >= 0.8 ? 'bg-nominal' : 'bg-warning'"
                label="Efficacité"
              />
              <span class="text-xs font-semibold tabular">{{ Math.round((run.efficacy ?? 0) * 100) }} %</span>
            </span>
          </td>
        </tr>
      </tbody>
    </BoardGroup>

    <!-- Protocol library (spec F4.1) -->
    <section>
      <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Bibliothèque</p>
      <h2 class="mt-1 text-xl font-semibold">Tous les protocoles disponibles à bord</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="protocol in protocols"
          :key="protocol.code"
          class="flex flex-col rounded-2xl border border-divider bg-surface p-5 shadow-card"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <component
                :is="protocol.domain ? DOMAINS[protocol.domain].icon : Sparkles"
                :size="19"
                :stroke-width="1.7"
                aria-hidden="true"
              />
            </span>
            <UiStatusBadge :level="protocol.level" />
          </div>
          <h3 class="mt-4 font-semibold">{{ protocol.title }}</h3>
          <p class="mt-1 flex-1 text-sm text-ink-muted">{{ protocol.summary }}</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-xs text-ink-muted">{{ protocol.code }} · {{ protocol.minutes }} min</span>
            <UiButton variant="secondary" size="sm" :to="`/equipage/protocoles/${protocol.code}`"
              >Voir</UiButton
            >
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
