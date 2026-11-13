<script setup lang="ts">
import {
  Activity,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  ListChecks,
  MessageSquare,
  Mic,
  Plus,
  Save,
} from 'lucide-vue-next'
import { DOMAIN_KEYS, DOMAINS } from '~/constants/domains'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Level } from '~/types/domain'
import { levelFromScore } from '~/utils/health'

/**
 * Page M-03: astronaut medical record seen by the CMO (spec F9.3, Figma "M-03 · Dossier astronaute").
 */
definePageMeta({
  layout: 'app',
  validate: (route) => useMissionData().findCrew(String(route.params.code)) !== undefined,
})

const route = useRoute()
const { findCrew, mission } = useMissionData()
const member = computed(() => findCrew(String(route.params.code))!)

useHead({ title: () => `Dossier ${member.value.firstName} ${member.value.lastName}` })

const TABS = ['Aperçu', 'Mesures', 'Alertes · 6', 'Protocoles', 'Journal médical', 'Rapports']
const activeTab = ref(TABS[0])

const MEASURES: { name: string; value: string; baseline: string; level: Level }[] = [
  { name: 'FC repos', value: '72 bpm', baseline: '68', level: 'nominal' },
  { name: 'VFC RMSSD', value: '31 ms', baseline: '48', level: 'warning' },
  { name: 'PA', value: '118/76', baseline: '116/74', level: 'nominal' },
  { name: 'SpO₂', value: '98 %', baseline: '98', level: 'nominal' },
  { name: 'Sommeil', value: '5 h 40', baseline: '7 h 05', level: 'warning' },
  { name: 'Dose mission', value: '89,1 mSv', baseline: '—', level: 'nominal' },
]

const JOURNAL = [
  {
    title: 'Alerte HRV-01 · VFC basse persistante',
    when: 'Aujourd’hui 06:12 · moteur IA',
    text: 'Protocole PRT-STRESS-01 proposé, étape 1 terminée.',
    dot: 'bg-warning',
  },
  {
    title: 'Check-in quotidien',
    when: 'Hier 08:04',
    text: 'Stress 7/10, sommeil perçu 3,5/10, douleurs dorsales modérées.',
    dot: 'bg-primary',
  },
  {
    title: 'Consigne du flight surgeon',
    when: 'J+141 17:02 · Dr M. Reyes',
    text: '« Prolonger la fenêtre de sommeil de 45 min pendant 3 nuits. »',
    dot: 'bg-brand-violet',
  },
  {
    title: 'Consultation · Kenji Arai',
    when: 'J+139 19:30',
    text: 'Fatigue signalée. Aucun signe infectieux. Revoir dans 3 jours.',
    dot: 'bg-nominal',
  },
]

const RUNS = [
  { code: 'PRT-STRESS-01', status: 'En cours · étape 2 sur 5', efficacy: null },
  { code: 'PRT-HYD-01', status: 'Terminé J+138', efficacy: 0.82 },
  { code: 'PRT-STRESS-01', status: 'Terminé J+131', efficacy: 0.64 },
]

const note = ref('')
</script>

<template>
  <div class="space-y-5">
    <nav aria-label="Fil d’Ariane" class="flex items-center gap-1.5 text-sm text-ink-muted">
      <NuxtLink to="/cmo" class="hover:text-ink">Équipage</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span class="font-medium text-ink" aria-current="page"
        >{{ member.firstName }} {{ member.lastName }}</span
      >
    </nav>

    <!-- Identity -->
    <section
      class="flex flex-wrap items-center gap-6 rounded-2xl border border-divider bg-surface p-6 shadow-card"
    >
      <UiAvatar :initials="member.initials" :tone="member.tone" :size="80" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-[28px] font-semibold">{{ member.firstName }} {{ member.lastName }}</h1>
          <UiStatusBadge
            :level="member.level"
            size="md"
            :label="`${LEVEL_STYLES[member.level].label} · ${member.score}`"
          />
        </div>
        <p class="mt-0.5 text-sm text-ink-muted">
          {{ member.code }} · {{ member.role }} · jour {{ mission.day }} en microgravité
        </p>
        <div class="mt-3 flex flex-wrap gap-2 text-xs">
          <span class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1">
            <ClipboardCheck :size="13" aria-hidden="true" /> Dernier check-in : hier 08:04
          </span>
          <span class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1">
            <ListChecks :size="13" aria-hidden="true" /> 1 protocole en cours
          </span>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" size="sm" :icon="MessageSquare">Message</UiButton>
        <UiButton variant="secondary" size="sm" :icon="FileText">Rapport PDF</UiButton>
        <UiButton size="sm" :icon="Plus">Nouvelle consultation</UiButton>
      </div>
    </section>

    <!-- Record tabs -->
    <nav aria-label="Sections du dossier" class="flex gap-1 border-b border-divider">
      <button
        v-for="tab in TABS"
        :key="tab"
        type="button"
        class="relative h-11 px-3 text-sm font-medium"
        :class="activeTab === tab ? 'text-primary' : 'text-ink-muted hover:text-ink'"
        :aria-current="activeTab === tab ? 'page' : undefined"
        @click="activeTab = tab"
      >
        {{ tab }}
        <span v-if="activeTab === tab" class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
      </button>
    </nav>

    <div class="grid gap-5 xl:grid-cols-3">
      <div class="space-y-5">
        <UiCard title="Scores par domaine" :icon="Activity">
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
                <span class="flex-1 font-medium">{{ DOMAINS[key].short }}</span>
                <span class="w-8 text-right font-semibold tabular">{{ member.domains[key] }}</span>
                <UiStatusBadge :level="levelFromScore(member.domains[key])" />
              </div>
              <UiProgress
                class="mt-1.5"
                :value="member.domains[key]"
                :height="5"
                :bar-class="LEVEL_STYLES[levelFromScore(member.domains[key])].bar"
                :label="`Score ${DOMAINS[key].short}`"
              />
            </li>
          </ul>
        </UiCard>

        <UiCard title="Dernières mesures" :icon="Activity" :padded="false">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-y border-divider text-left text-xs text-ink-muted">
                <th scope="col" class="px-5 py-2 font-medium">Mesure</th>
                <th scope="col" class="px-2 py-2 font-medium">Valeur</th>
                <th scope="col" class="px-2 py-2 font-medium">Baseline</th>
                <th scope="col" class="px-5 py-2"><span class="sr-only">Statut</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in MEASURES" :key="row.name" class="border-b border-divider last:border-0">
                <th scope="row" class="px-5 py-2.5 text-left font-semibold">{{ row.name }}</th>
                <td class="px-2 py-2.5 tabular">{{ row.value }}</td>
                <td class="px-2 py-2.5 text-ink-muted tabular">{{ row.baseline }}</td>
                <td class="px-5 py-2.5 text-right"><UiStatusBadge :level="row.level" /></td>
              </tr>
            </tbody>
          </table>
        </UiCard>
      </div>

      <UiCard
        title="Journal médical"
        subtitle="Alertes, check-ins, consultations, consignes du sol"
        :icon="BookOpen"
      >
        <template #actions><UiButton variant="ghost" size="sm">Tout voir</UiButton></template>
        <ol class="relative space-y-5 border-l border-divider pl-5">
          <li v-for="entry in JOURNAL" :key="entry.title" class="relative">
            <span
              class="absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-surface"
              :class="entry.dot"
            />
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-sm font-semibold">{{ entry.title }}</p>
              <p class="text-xs text-ink-muted">{{ entry.when }}</p>
            </div>
            <p class="mt-0.5 text-sm text-ink-muted">{{ entry.text }}</p>
          </li>
        </ol>
      </UiCard>

      <div class="space-y-5">
        <UiCard title="Note de consultation" :icon="MessageSquare">
          <label for="consultation-note" class="sr-only">Note de consultation</label>
          <textarea
            id="consultation-note"
            v-model="note"
            rows="4"
            placeholder="Observations, examen, conduite à tenir…"
            class="w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary"
          />
          <div class="mt-3 flex justify-between">
            <UiButton variant="secondary" size="sm" :icon="Mic">Dicter</UiButton>
            <UiButton size="sm" :icon="Save" :disabled="!note">Enregistrer</UiButton>
          </div>
          <p class="mt-2 text-xs text-ink-muted">Ajoutée au journal d’audit, non modifiable ensuite.</p>
        </UiCard>

        <UiCard title="Protocoles exécutés" :icon="ListChecks">
          <ul class="space-y-2.5">
            <li
              v-for="(run, index) in RUNS"
              :key="`${run.code}-${index}`"
              class="flex items-center gap-3 rounded-xl border border-divider p-3"
            >
              <span class="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <ListChecks :size="16" aria-hidden="true" />
              </span>
              <span class="flex-1 text-sm">
                <span class="block font-mono text-xs font-semibold">{{ run.code }}</span>
                <span class="block text-xs text-ink-muted">{{ run.status }}</span>
              </span>
              <span
                v-if="run.efficacy !== null"
                class="text-sm font-semibold tabular"
                :class="run.efficacy >= 0.8 ? 'text-nominal-ink' : 'text-warning-ink'"
              >
                {{ Math.round(run.efficacy * 100) }} %
              </span>
              <Check v-else :size="16" class="text-ink-faint" aria-label="En cours" />
            </li>
          </ul>
        </UiCard>
      </div>
    </div>
  </div>
</template>
