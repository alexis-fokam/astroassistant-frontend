<script setup lang="ts">
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flag,
  Globe,
  Moon,
  Rocket,
  Shield,
  Timer,
} from 'lucide-vue-next'

/**
 * Page A-03: first-launch mission setup, step 1 of 4 (spec §7, F10.3,
 * Figma "A-03 · Configuration de la mission"). Settings drive latency, day/night cycle
 * and dose projection.
 */
definePageMeta({ layout: 'bare' })
useHead({ title: 'Configuration de la mission' })

const STEPS = ['Mission', 'Équipage', 'Liaison sol', 'Langue & accessibilité']
const CURRENT_STEP = 0

const DESTINATIONS = [
  { id: 'leo', icon: Globe, label: 'Orbite basse', hint: 'ISS · 16 levers/jour', latency: 0 },
  { id: 'moon', icon: Moon, label: 'Lune', hint: 'Artemis · 1,3 s', latency: 0 },
  { id: 'mars-transit', icon: Rocket, label: 'Transit Mars', hint: '4 à 22 min', latency: 12 },
  { id: 'mars-surface', icon: Flag, label: 'Surface Mars', hint: 'Sol de 24 h 39', latency: 22 },
]

const language = ref('fr')
const LANGUAGES = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
]

const form = reactive({
  destination: 'mars-transit',
  name: 'Artemis-M',
  startDate: '2026-06-23',
  durationDays: 200,
  flightProfile: 'Transit aller · blindage standard',
  latency: 12,
})

// Mission profile saved on the backend (CMO session): it sets the Earth-crew delay.
const API_DESTINATIONS: Record<string, string> = {
  leo: 'low_earth_orbit',
  moon: 'moon',
  'mars-transit': 'mars_transit',
  'mars-surface': 'mars_surface',
}
const { setDestination } = useActions()
const saveNote = ref<string | null>(null)

async function save() {
  try {
    const saved = await setDestination(API_DESTINATIONS[form.destination]!)
    saveNote.value = saved ? 'Profil de mission enregistré : le délai de communication est mis à jour.' : null
  } catch (e) {
    saveNote.value = (e as Error).message
  }
  await navigateTo('/profil/nouveau')
}

function selectDestination(destination: (typeof DESTINATIONS)[number]) {
  form.destination = destination.id
  // Destinations without a meaningful delay keep the current simulated latency.
  if (destination.latency) form.latency = destination.latency
}
</script>

<template>
  <ShellOnboardingFrame>
    <template #actions>
      <span class="hidden sm:inline">Configuration initiale · environ 3 minutes</span>
      <UiSegmented v-model="language" :options="LANGUAGES" size="sm" label="Langue" />
    </template>

    <ol
      class="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-3"
      aria-label="Étapes de configuration"
    >
      <li v-for="(step, index) in STEPS" :key="step" class="flex items-center gap-3">
        <span
          class="flex size-8 items-center justify-center rounded-full text-sm font-semibold"
          :class="
            index === CURRENT_STEP ? 'bg-primary text-white' : 'border border-line bg-surface text-ink-muted'
          "
          :aria-current="index === CURRENT_STEP ? 'step' : undefined"
        >
          {{ index + 1 }}
        </span>
        <span
          class="hidden text-sm sm:inline"
          :class="index === CURRENT_STEP ? 'font-medium text-primary' : 'text-ink-muted'"
        >
          {{ step }}
        </span>
        <span v-if="index < STEPS.length - 1" class="hidden h-px w-14 bg-line md:block" aria-hidden="true" />
      </li>
    </ol>

    <form class="mx-auto mt-8 max-w-3xl rounded-2xl bg-surface p-8 shadow-raised" @submit.prevent="save">
      <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Étape 1 sur 4</p>
      <h1 class="mt-2 text-[28px] font-semibold">Décrivez votre mission</h1>
      <p class="mt-1 text-ink-muted">
        Ces réglages adaptent la latence, le cycle jour/nuit et la projection de dose.
      </p>

      <fieldset class="mt-6">
        <legend class="text-sm font-semibold">Destination</legend>
        <div class="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          <button
            v-for="destination in DESTINATIONS"
            :key="destination.id"
            type="button"
            role="radio"
            :aria-checked="form.destination === destination.id"
            class="rounded-xl border p-4 text-left transition-colors"
            :class="
              form.destination === destination.id
                ? 'border-2 border-primary bg-primary-soft'
                : 'border-line hover:bg-subtle'
            "
            @click="selectDestination(destination)"
          >
            <component
              :is="destination.icon"
              :size="22"
              :class="form.destination === destination.id ? 'text-primary' : 'text-ink-muted'"
              aria-hidden="true"
            />
            <span class="mt-3 block text-sm font-semibold">{{ destination.label }}</span>
            <span class="block text-xs text-ink-muted">{{ destination.hint }}</span>
          </button>
        </div>
      </fieldset>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="block">
          <span class="text-sm font-semibold">Nom de la mission</span>
          <span class="relative mt-1.5 block">
            <Flag
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              v-model="form.name"
              type="text"
              class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </span>
        </label>
        <label class="block">
          <span class="text-sm font-semibold">Date de début</span>
          <span class="relative mt-1.5 block">
            <CalendarDays
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              v-model="form.startDate"
              type="date"
              class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </span>
        </label>
        <label class="block">
          <span class="text-sm font-semibold">Durée prévue (jours)</span>
          <span class="relative mt-1.5 block">
            <Timer
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <input
              v-model.number="form.durationDays"
              type="number"
              min="1"
              class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </span>
        </label>
        <label class="block">
          <span class="text-sm font-semibold">Profil de vol</span>
          <span class="relative mt-1.5 block">
            <Shield
              :size="16"
              class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
              aria-hidden="true"
            />
            <select
              v-model="form.flightProfile"
              class="h-11 w-full appearance-none rounded-lg border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
            >
              <option>Transit aller · blindage standard</option>
              <option>Transit aller · blindage renforcé</option>
              <option>Séjour en surface</option>
            </select>
          </span>
        </label>
      </div>

      <div class="mt-5">
        <p class="text-sm font-semibold">Latence simulée aller simple</p>
        <UiSlider
          v-model="form.latency"
          class="mt-2"
          :min="4"
          :max="22"
          label="Latence simulée"
          :value-text="`${form.latency} minutes`"
        />
        <div class="flex justify-between text-xs text-ink-muted">
          <span>4 min</span>
          <span class="font-semibold text-primary tabular">{{ form.latency }} min</span>
          <span>22 min</span>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between gap-3">
        <UiButton variant="ghost" :icon="ChevronLeft" to="/connexion">Retour</UiButton>
        <span class="flex items-center gap-4">
          <span class="hidden text-sm text-ink-muted sm:inline">Modifiable plus tard dans Paramètres</span>
          <UiButton type="submit" :icon="ChevronRight">Continuer</UiButton>
        </span>
      </div>
    </form>
  </ShellOnboardingFrame>
</template>
