<script setup lang="ts">
import {
  Box,
  CircleCheck,
  Droplet,
  FileText,
  HeartPulse,
  OctagonAlert,
  Pill,
  Send,
  Siren,
  Sparkles,
  Timer,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * Page U-04 : clôture d'une urgence (F12, F14, Figma « U-04 »).
 * Le médecin de bord note l'issue, les gestes et ses observations ; le brouillon est gardé
 * sur ce poste jusqu'à la clôture, qui met le rapport en file vers le sol.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Clôturer l’urgence') })

const { activeEmergency, closeEmergency } = useActions()
const { data: emergency } = await useAsyncData('closing-emergency', () => activeEmergency().catch(() => null))
const closeError = ref<string | null>(null)

const OUTCOME_LABELS: Record<string, string> = {
  stabilised: 'stabilisée',
  monitoring: 'surveillance rapprochée',
  evacuation: 'évacuation demandée',
}

async function close() {
  closeError.value = null
  try {
    if (emergency.value) {
      const done = actions.value.filter((a) => a.done).map((a) => a.label)
      const summary = `${notes.value}\n\nGestes réalisés : ${done.join(', ')}.`
      await closeEmergency(emergency.value.id, OUTCOME_LABELS[outcome.value]!, summary)
    }
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* stockage indisponible : rien à effacer */
    }
    await navigateTo('/sol')
  } catch (e) {
    closeError.value = (e as Error).message
  }
}

const outcome = ref('stabilised')
const OUTCOMES = [
  { value: 'stabilised', label: 'Stabilisée' },
  { value: 'monitoring', label: 'Surveillance rapprochée' },
  { value: 'evacuation', label: 'Évacuation demandée' },
]

const actions = ref([
  { label: 'Sécurisation et maintien', done: true },
  { label: 'Contrôle conscience / respiration', done: true },
  { label: 'Oxymètre et brassard posés', done: true },
  { label: 'Oxygène administré', done: true },
  { label: 'Appel du médecin de bord', done: true },
  { label: 'Défibrillateur', done: false },
])

const notes = ref(
  'Tachycardie sinusale probablement liée à une déshydratation et à l’effort. Réhydratation orale, repos 24 h, surveillance FC toutes les heures.',
)

// Brouillon gardé sur ce poste (navigateur) tant que l'urgence n'est pas clôturée.
const DRAFT_KEY = 'aa_emergency_draft'
const draftSavedAt = ref<string | null>(null)
function saveDraft() {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ outcome: outcome.value, notes: notes.value, actions: actions.value }),
    )
    draftSavedAt.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    draftSavedAt.value = null
  }
}
onMounted(() => {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
    if (draft) {
      outcome.value = draft.outcome ?? outcome.value
      notes.value = draft.notes ?? notes.value
      if (Array.isArray(draft.actions)) actions.value = draft.actions
    }
  } catch {
    /* brouillon illisible : on garde le formulaire par défaut */
  }
})

// Résumé construit à partir du formulaire (issue et gestes cochés), sans IA générative.
const autoSummary = computed(() => {
  const done = actions.value.filter((a) => a.done).map((a) => a.label.toLowerCase())
  const issue = OUTCOME_LABELS[outcome.value] ?? outcome.value
  return t('Urgence {issue}. Gestes réalisés : {done}.', { issue, done: done.join(', ') || '—' })
})

const SUPPLIES = [
  { icon: Pill, name: 'Oxygène portable', detail: '1 bouteille · 14 min' },
  { icon: Box, name: 'Électrodes ECG', detail: '×4 · kit B' },
]

const TIMELINE: { time: string; text: string; icon: Component; dot: string; ink: string }[] = [
  {
    time: '14:22:08',
    text: 'Urgence déclenchée par Léo Martin (2 gestes)',
    icon: Siren,
    dot: 'bg-critical',
    ink: 'text-critical-ink',
  },
  {
    time: '14:22:10',
    text: 'Équipage alerté · paquet CRITICAL en tête de file',
    icon: Users,
    dot: 'bg-primary',
    ink: 'text-primary',
  },
  {
    time: '14:23:40',
    text: 'FC 128 bpm · SpO₂ 92 % · capteurs connectés',
    icon: HeartPulse,
    dot: 'bg-critical',
    ink: 'text-critical-ink',
  },
  {
    time: '14:25:02',
    text: 'Oxygène administré 2 L/min',
    icon: Droplet,
    dot: 'bg-primary',
    ink: 'text-primary',
  },
  {
    time: '14:31:15',
    text: 'FC 96 bpm · SpO₂ 97 %',
    icon: HeartPulse,
    dot: 'bg-nominal',
    ink: 'text-nominal-ink',
  },
  {
    time: '14:38:00',
    text: 'Patiente stabilisée, consciente',
    icon: CircleCheck,
    dot: 'bg-nominal',
    ink: 'text-nominal-ink',
  },
]
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Clôturer l’urgence"
      subtitle="Urgence médicale · Sara Lindqvist (AV-03) · durée 16 min 52 s"
    >
      <template #actions>
        <span
          class="flex items-center gap-1.5 rounded-full bg-critical-soft px-3 py-1.5 text-sm font-semibold text-critical-ink"
        >
          <OctagonAlert :size="15" aria-hidden="true" /> CRITICAL → en cours de clôture
        </span>
      </template>
    </UiPageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <UiCard title="Compte rendu" :icon="FileText">
        <fieldset>
          <legend class="text-sm font-semibold">Issue</legend>
          <div class="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Issue de l’urgence">
            <button
              v-for="option in OUTCOMES"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="outcome === option.value"
              class="h-12 rounded-lg border text-sm font-medium transition-colors"
              :class="
                outcome === option.value
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line hover:bg-subtle'
              "
              @click="outcome = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>

        <div class="mt-5 grid gap-6 md:grid-cols-2">
          <fieldset>
            <legend class="text-sm font-semibold">Actions réalisées</legend>
            <ul class="mt-2 space-y-2">
              <li v-for="action in actions" :key="action.label">
                <label class="flex items-center gap-2.5 text-sm">
                  <input v-model="action.done" type="checkbox" class="size-4 accent-primary" />
                  {{ action.label }}
                </label>
              </li>
            </ul>
          </fieldset>
          <div>
            <p class="text-sm font-semibold">Matériel et médicaments utilisés</p>
            <ul class="mt-2 space-y-2">
              <li
                v-for="supply in SUPPLIES"
                :key="supply.name"
                class="flex items-center gap-3 rounded-xl border border-divider p-3"
              >
                <component :is="supply.icon" :size="17" class="text-primary" aria-hidden="true" />
                <span class="text-sm">
                  <span class="block font-semibold">{{ supply.name }}</span>
                  <span class="block text-xs text-ink-muted">{{ supply.detail }}</span>
                </span>
              </li>
            </ul>
            <p class="mt-2 text-xs text-ink-muted">Ajouté automatiquement au registre de la pharmacie.</p>
          </div>
        </div>

        <label class="mt-5 block">
          <span class="text-sm font-semibold">Observations du médecin de bord</span>
          <textarea
            v-model="notes"
            rows="3"
            class="mt-2 w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary"
          />
        </label>
      </UiCard>

      <div class="space-y-5">
        <UiCard
          title="Chronologie automatique"
          subtitle="Issue du journal d’audit, non modifiable"
          :icon="Timer"
        >
          <ol class="relative space-y-4 border-l border-divider pl-6">
            <li v-for="event in TIMELINE" :key="event.time" class="relative flex items-start gap-3">
              <span
                class="absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-4 ring-surface"
                :class="event.dot"
              />
              <component
                :is="event.icon"
                :size="16"
                class="mt-0.5 shrink-0"
                :class="event.ink"
                aria-hidden="true"
              />
              <span class="flex-1 text-sm">{{ event.text }}</span>
              <span class="text-xs text-ink-muted tabular">{{ event.time }}</span>
            </li>
          </ol>
        </UiCard>
        <p class="flex items-start gap-2.5 rounded-xl bg-accent-soft p-4 text-sm">
          <Sparkles :size="17" class="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <b>{{ t('Résumé transmis au sol :') }}</b> {{ autoSummary }}
          </span>
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <p v-if="closeError" class="text-sm text-critical-ink" role="alert">{{ closeError }}</p>
      <UiButton variant="danger" :icon="Send" @click="close">Clôturer et transmettre au sol</UiButton>
      <UiButton variant="secondary" @click="saveDraft">{{ t('Enregistrer le brouillon') }}</UiButton>
      <p v-if="draftSavedAt" class="self-center text-sm text-nominal-ink" role="status">
        {{ t('Brouillon enregistré à {time}', { time: draftSavedAt }) }}
      </p>
    </div>
  </div>
</template>
