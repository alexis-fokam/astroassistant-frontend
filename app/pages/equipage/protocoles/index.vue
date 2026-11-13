<script setup lang="ts">
import { ArrowUpDown, Filter, History, Play, Search, Sparkles } from 'lucide-vue-next'
import { DOMAINS } from '~/constants/domains'
import { LEVEL_HEX } from '~/constants/levels'
import { PROTOCOL_RUNS, type RunProgress } from '~/mocks/protocolRuns'

/**
 * Page E-07: my protocols (spec F4, Figma "E-07 · Mes protocoles").
 * Every WARNING / CRITICAL alert offers at least one protocol (F4 acceptance criterion).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Mes protocoles' })

const { protocols } = useMissionData()

const filter = ref('active')
const FILTERS = [
  { value: 'active', label: 'Actifs · 3' },
  { value: 'done', label: 'Terminés' },
  { value: 'all', label: 'Tous' },
]

const pending = computed(() => PROTOCOL_RUNS.filter((run) => run.progress !== 'done'))
const done = computed(() => PROTOCOL_RUNS.filter((run) => run.progress === 'done'))

const PROGRESS: Record<RunProgress, { label: string; classes: string }> = {
  in_progress: { label: 'En cours', classes: 'bg-primary text-white' },
  todo: { label: 'À faire', classes: 'bg-brand-lavender text-ink' },
  done: { label: 'Terminé', classes: 'bg-line text-ink' },
}

const COLUMNS = ['Protocole', 'Déclencheur', 'Gravité', 'Durée', 'Avancement', 'Efficacité']
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[28px] font-semibold">Mes protocoles</h1>
        <p class="mt-0.5 text-sm text-ink-muted">
          Chaque alerte WARNING ou CRITICAL propose au moins un protocole (F4)
        </p>
      </div>
      <UiButton variant="secondary" size="sm" :icon="History">Historique</UiButton>
    </div>

    <!-- Recommended now -->
    <section
      class="flex flex-wrap items-center gap-5 rounded-2xl border border-brand-lavender/60 p-6"
      style="background-image: linear-gradient(100deg, #f1eafd 0%, #f5f9ff 60%, #ffffff 100%)"
    >
      <span class="flex size-14 items-center justify-center rounded-2xl bg-ai-gradient text-white">
        <Sparkles :size="26" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">
          Recommandé par Astro · maintenant
        </p>
        <h2 class="mt-1 text-xl font-semibold">Respiration guidée & récupération du sommeil</h2>
        <p class="mt-0.5 text-sm text-ink-muted">
          PRT-STRESS-01 · 9 minutes · déclenché par la baisse de votre VFC (65 % de votre baseline)
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton :icon="Play" to="/equipage/protocoles/PRT-STRESS-01">Reprendre · étape 2/5</UiButton>
        <UiButton variant="secondary" to="/equipage/systemes/behavioral">Pourquoi ?</UiButton>
      </div>
    </section>

    <!-- Board toolbar -->
    <div class="flex flex-wrap items-center gap-1">
      <UiButton variant="ghost" size="sm" :icon="Search">Rechercher</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Filter">Filtrer</UiButton>
      <UiButton variant="ghost" size="sm" :icon="ArrowUpDown">Trier</UiButton>
      <UiSegmented v-model="filter" class="ml-auto" :options="FILTERS" size="sm" label="Afficher" />
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
