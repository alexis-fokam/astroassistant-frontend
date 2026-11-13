<script setup lang="ts">
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  ListChecks,
  Plus,
  Send,
  Sparkles,
  TriangleAlert,
  UserRound,
  Users,
} from 'lucide-vue-next'

/**
 * Page M-04: consultation record (spec F9.3, Figma "M-04 · Fiche consultation").
 * Layout inspired by meeting notes: summary, action items, linked measures, participants,
 * and the embedded assistant suggesting next steps.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Consultation · vision floue' })

const TABS = ['Aperçu', 'Éléments d’action · 3', 'Notes', 'Pièces jointes', 'Participants']
const activeTab = ref(TABS[0])

const SUMMARY = [
  { text: 'Vision floue déclarée au check-in deux jours de suite, céphalées modérées.', flagged: false },
  { text: 'Acuité visuelle : OD 8/10, OG 9/10. Test d’Amsler sans anomalie.', flagged: false },
  { text: 'CO₂ cabine dans les normes (0,42 %). Pas de signe infectieux.', flagged: false },
  { text: 'Suspicion de SANS à confirmer par OCT.', flagged: true },
]

const actions = ref([
  { title: 'Test d’Amsler à J+144', detail: 'Échéance J+144 · PRT-SANS-01', done: false },
  { title: 'OCT au prochain créneau', detail: 'Demandé par le flight surgeon', done: false },
  { title: 'Collyre lubrifiant 3×/jour', detail: 'Pharmacie · module B', done: true },
])

const MEASURES = [
  { label: 'Acuité OD / OG', value: '8/10 · 9/10', flagged: false },
  { label: 'Pression intraoculaire', value: 'Non mesurée', flagged: false },
  { label: 'Céphalées (check-in)', value: 'Modérées ×2', flagged: true },
  { label: 'CO₂ cabine', value: '0,42 %', flagged: false },
  { label: 'Jours en microgravité', value: '142', flagged: false },
]

const PARTICIPANTS = [
  { initials: 'KA', tone: 4, label: 'Kenji Arai · patient & CMO' },
  { initials: 'NO', tone: 1, label: 'Nadia Okafor · témoin' },
  { initials: 'MR', tone: 2, label: 'Dr Maya Reyes · en différé' },
]
</script>

<template>
  <div class="space-y-5">
    <nav aria-label="Fil d’Ariane" class="flex items-center gap-1.5 text-sm text-ink-muted">
      <NuxtLink to="/cmo/equipage/AV-02" class="hover:text-ink">Dossiers médicaux</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <NuxtLink to="/cmo/equipage/AV-04" class="hover:text-ink">Kenji Arai</NuxtLink>
      <ChevronRight :size="14" aria-hidden="true" />
      <span class="font-medium text-ink" aria-current="page">Consultation vision</span>
    </nav>

    <section
      class="flex flex-wrap items-center gap-5 rounded-2xl border border-divider bg-surface p-6 shadow-card"
    >
      <span class="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Eye :size="26" aria-hidden="true" />
      </span>
      <div class="flex-1">
        <h1 class="text-[28px] font-semibold">Consultation · vision floue</h1>
        <p class="mt-1 flex flex-wrap gap-4 text-sm text-ink-muted">
          <span class="flex items-center gap-1.5"
            ><CalendarDays :size="14" aria-hidden="true" /> J+142 · 10:20</span
          >
          <span class="flex items-center gap-1.5"><Clock :size="14" aria-hidden="true" /> 24 min</span>
          <span class="flex items-center gap-1.5"
            ><UserRound :size="14" aria-hidden="true" /> Patient : Kenji Arai (AV-04)</span
          >
        </p>
      </div>
      <UiStatusBadge level="warning" size="md" label="Suspicion SANS" />
      <UiButton variant="secondary" :icon="Send">Partager au sol</UiButton>
    </section>

    <nav aria-label="Sections de la consultation" class="flex gap-1 border-b border-divider">
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

    <div class="grid gap-5 xl:grid-cols-[1fr_1fr_340px]">
      <div class="space-y-5">
        <UiCard title="Résumé" :icon="FileText">
          <template #actions>
            <UiButton variant="ghost" size="sm" :icon-right="ChevronDown">Modèle</UiButton>
          </template>
          <ul class="space-y-2.5 text-sm">
            <li v-for="line in SUMMARY" :key="line.text" class="flex gap-2.5">
              <component
                :is="line.flagged ? TriangleAlert : Check"
                :size="16"
                class="mt-0.5 shrink-0"
                :class="line.flagged ? 'text-warning-ink' : 'text-nominal-ink'"
                aria-hidden="true"
              />
              {{ line.text }}
            </li>
          </ul>
        </UiCard>

        <UiCard title="Éléments d’action" :icon="ListChecks">
          <template #actions
            ><UiButton variant="secondary" size="sm" :icon="Plus">Ajouter</UiButton></template
          >
          <ul class="space-y-2.5">
            <li v-for="action in actions" :key="action.title">
              <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-divider p-3">
                <input v-model="action.done" type="checkbox" class="size-4 accent-primary" />
                <span class="flex-1 text-sm">
                  <span class="block font-semibold">{{ action.title }}</span>
                  <span class="block text-xs text-ink-muted">{{ action.detail }}</span>
                </span>
                <UiAvatar initials="KA" :tone="4" :size="26" />
              </label>
            </li>
          </ul>
        </UiCard>
      </div>

      <div class="space-y-5">
        <UiCard title="Mesures liées" :icon="Activity">
          <dl class="space-y-3 text-sm">
            <div v-for="measure in MEASURES" :key="measure.label" class="flex justify-between gap-3">
              <dt class="text-ink-muted">{{ measure.label }}</dt>
              <dd class="font-semibold tabular" :class="measure.flagged && 'text-warning-ink'">
                {{ measure.value }}
              </dd>
            </div>
          </dl>
        </UiCard>

        <UiCard title="Participants" :icon="Users">
          <ul class="space-y-3">
            <li v-for="person in PARTICIPANTS" :key="person.label" class="flex items-center gap-3 text-sm">
              <UiAvatar :initials="person.initials" :tone="person.tone" :size="30" />
              {{ person.label }}
            </li>
          </ul>
        </UiCard>
      </div>

      <section
        class="h-fit overflow-hidden rounded-2xl border border-divider bg-surface shadow-raised"
        aria-label="Astro assistant"
      >
        <div class="h-1 bg-ai-gradient" />
        <div class="p-5">
          <p class="flex items-center gap-2 font-semibold">
            <Sparkles :size="17" class="text-accent" aria-hidden="true" /> Astro · assistant
          </p>
          <p class="mt-3 rounded-xl bg-accent-soft p-3.5 text-sm">
            Pour un tableau SANS, NASA-STD-3001 recommande un suivi régulier de l’acuité et un fond d’œil. Je
            peux préparer un paquet pour le flight surgeon avec ces mesures.
          </p>
          <div class="mt-3 space-y-2">
            <UiButton variant="ai" size="sm" block :icon="Send" to="/sol">Préparer le paquet sol</UiButton>
            <UiButton variant="secondary" size="sm" block :icon="CalendarDays"
              >Programmer le test J+144</UiButton
            >
          </div>
          <form
            class="mt-4 flex items-center gap-2 rounded-full border border-line px-4 py-2"
            @submit.prevent
          >
            <label for="consultation-ask" class="sr-only">Demander à Astro</label>
            <input
              id="consultation-ask"
              type="text"
              placeholder="Demander à Astro…"
              class="flex-1 text-sm outline-none"
            />
            <button type="submit" class="text-primary" aria-label="Envoyer">
              <Send :size="16" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>
