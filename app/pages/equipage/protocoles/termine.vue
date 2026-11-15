<script setup lang="ts">
import {
  Activity,
  ArrowDown,
  CalendarDays,
  Check,
  ChevronRight,
  Info,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  Plus,
  RefreshCw,
  Smile,
  Users,
} from 'lucide-vue-next'

/**
 * Page E-09: end of protocol and efficacy re-evaluation (spec F4.5,
 * Figma "E-09 · Fin de protocole & réévaluation").
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
// Rappel du coucher avancé, ajouté au planning de ce poste.
const reminderAdded = ref(false)
useHead({ title: 'Protocole terminé' })

const EFFICACY = 64
const ringCircumference = 2 * Math.PI * 54

const BEFORE_AFTER = [
  { label: 'VFC (RMSSD)', before: '31 ms', after: '40 ms', delta: '+29 %', improved: true },
  { label: 'Fréquence cardiaque', before: '74 bpm', after: '66 bpm', delta: '−8 bpm', improved: true },
  { label: 'Stress déclaré', before: '7 / 10', after: '5 / 10', delta: '−2', improved: true },
  { label: 'Score comportemental', before: '68', after: '55', delta: 'encore WARNING', improved: false },
]

const FEELINGS = [
  { value: 'worse', emoji: '😣', label: 'Moins bien' },
  { value: 'same', emoji: '😕', label: 'Pareil' },
  { value: 'slightly', emoji: '🙂', label: 'Un peu mieux' },
  { value: 'better', emoji: '😌', label: 'Mieux' },
  { value: 'much', emoji: '😄', label: 'Beaucoup mieux' },
]
const feeling = ref('better')
const comment = ref('')
</script>

<template>
  <div class="space-y-6">
    <section
      class="flex flex-wrap items-center gap-6 rounded-2xl border border-nominal/40 p-7"
      style="background-image: linear-gradient(100deg, #e3f8ee 0%, #f3fcf7 60%, #ffffff 100%)"
      role="status"
    >
      <span class="flex size-16 items-center justify-center rounded-full bg-nominal text-white">
        <Check :size="32" :stroke-width="3" aria-hidden="true" />
      </span>
      <div class="flex-1">
        <p class="text-[11px] font-semibold tracking-wider text-nominal-ink uppercase">
          Protocole terminé · 9 min 24 s
        </p>
        <h1 class="mt-1 text-[32px] font-semibold">Bravo Léo, c’est fait !</h1>
        <p class="mt-1 text-ink-muted">
          Respiration guidée & récupération du sommeil · PRT-STRESS-01 · 5 étapes sur 5
        </p>
      </div>
      <div class="relative size-32">
        <svg viewBox="0 0 128 128" class="size-32 -rotate-90" aria-hidden="true">
          <circle cx="64" cy="64" r="54" stroke="#eceef4" stroke-width="11" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="#00c875"
            stroke-width="11"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="`${(ringCircumference * EFFICACY) / 100} ${ringCircumference}`"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-display text-2xl font-bold text-nominal-ink tabular">{{ EFFICACY }} %</span>
          <span class="text-xs text-ink-muted">efficacité</span>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <UiCard title="Avant / après" :icon="Activity">
        <ul class="space-y-2.5">
          <li
            v-for="row in BEFORE_AFTER"
            :key="row.label"
            class="flex items-center gap-3 rounded-xl bg-subtle px-4 py-3 text-sm"
          >
            <span class="flex-1 font-semibold">{{ row.label }}</span>
            <span class="text-ink-muted tabular">{{ row.before }}</span>
            <ChevronRight :size="14" class="text-ink-faint" aria-hidden="true" />
            <span
              class="font-semibold tabular"
              :class="row.improved ? 'text-nominal-ink' : 'text-warning-ink'"
              >{{ row.after }}</span
            >
            <span class="w-28 text-xs" :class="row.improved ? 'text-nominal-ink' : 'text-warning-ink'">{{
              row.delta
            }}</span>
          </li>
        </ul>
        <p class="mt-3 flex items-start gap-2 rounded-xl bg-info-soft p-3 text-sm">
          <Info :size="16" class="mt-0.5 shrink-0 text-info-ink" aria-hidden="true" />
          <span
            >Critère de sortie (VFC ≥ 80 % baseline) <b>pas encore atteint</b>. Astro refera une mesure ce
            soir à 21:00.</span
          >
        </p>
      </UiCard>

      <UiCard title="Comment vous sentez-vous ?" :icon="Smile">
        <div class="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Ressenti après le protocole">
          <button
            v-for="option in FEELINGS"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="feeling === option.value"
            class="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border text-xs transition-colors"
            :class="
              feeling === option.value ? 'border-primary bg-primary-soft' : 'border-line hover:bg-subtle'
            "
            @click="feeling = option.value"
          >
            <span class="text-2xl" aria-hidden="true">{{ option.emoji }}</span>
            {{ option.label }}
          </button>
        </div>
        <label for="protocol-comment" class="sr-only">Commentaire pour le médecin de bord</label>
        <textarea
          id="protocol-comment"
          v-model="comment"
          rows="3"
          placeholder="Un commentaire pour le médecin de bord ? (facultatif)"
          class="mt-3 w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-primary"
        />
      </UiCard>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <UiCard title="Prochaine étape" :icon="CalendarDays">
        <div class="flex items-center gap-3 rounded-xl border border-divider p-3">
          <Moon :size="18" class="text-primary" aria-hidden="true" />
          <span class="flex-1 text-sm">
            <span class="block font-semibold">Coucher avancé à 22:45</span>
            <span class="block text-xs text-ink-muted">Rappel à 22:15 · 3 nuits</span>
          </span>
          <UiButton
            v-if="!reminderAdded"
            variant="secondary"
            size="sm"
            :icon="Plus"
            @click="reminderAdded = true"
          >
            {{ t('Ajouter') }}
          </UiButton>
          <span v-else class="flex items-center gap-1 text-xs font-semibold text-nominal-ink" role="status">
            <Check :size="14" aria-hidden="true" /> {{ t('Rappel ajouté') }}
          </span>
        </div>
      </UiCard>
      <UiCard title="Partagé avec" :icon="Users">
        <div class="flex items-center gap-3 text-sm">
          <UiAvatar initials="KA" :tone="4" :size="32" />
          <span>
            <span class="block font-semibold">Kenji Arai · CMO</span>
            <span class="block text-xs text-ink-muted">Résultat ajouté au journal médical</span>
          </span>
        </div>
      </UiCard>
      <UiCard title="Statut mis à jour" :icon="LayoutGrid">
        <div class="flex items-center gap-3">
          <UiStatusBadge level="warning" size="md" label="WARNING · 49" />
          <span class="flex items-center gap-1 text-sm text-ink-muted"
            ><ArrowDown :size="14" aria-hidden="true" /> −5 points</span
          >
        </div>
        <p class="mt-2 text-xs text-ink-muted">Encore une nuit complète devrait vous ramener en NOMINAL.</p>
      </UiCard>
    </div>

    <div class="flex flex-wrap gap-3">
      <UiButton :icon="LayoutDashboard" to="/equipage">Retour au tableau de bord</UiButton>
      <UiButton variant="secondary" :icon="RefreshCw" to="/equipage/protocoles/PRT-STRESS-01"
        >Refaire le protocole</UiButton
      >
    </div>
  </div>
</template>
