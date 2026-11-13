<script setup lang="ts">
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  Flag,
  Info,
  Lock,
  Plus,
  Sparkles,
  UserRound,
  X,
} from 'lucide-vue-next'

/**
 * Page A-04: create a crew profile (spec §7, §9 crew_member,
 * Figma "A-04 · Création d'un profil d'équipage"). Data stays on the device;
 * the PIN is stored as a hash only (backend app/core/security.py).
 */
definePageMeta({ layout: 'bare' })
useHead({ title: 'Nouveau profil d’équipage' })

const PIN_LENGTH = 6
// Avatar background choices (crew palette from the design system plus extra hues).
const AVATAR_COLORS = ['#2f86eb', '#9b5cf2', '#e8697d', '#0fb5ae', '#f5a623', '#5b5bd6', '#2eb872', '#8a4fd8']

const form = reactive({
  name: 'Sofia Castillo',
  code: 'AV-05',
  birthDate: '1988-03-14',
  massKg: 64,
  sex: 'female',
  role: 'astronaut',
  color: AVATAR_COLORS[4]!,
  pin: '',
})

const SEX_OPTIONS = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
  { value: 'other', label: 'Non précisé' },
]
const ROLE_OPTIONS = [
  { value: 'astronaut', label: 'Astronaute' },
  { value: 'cmo', label: 'Médecin de bord (CMO)' },
]

const initials = computed(() =>
  form.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join(''),
)
const roleLabel = computed(() => (form.role === 'cmo' ? 'Médecin de bord' : 'Astronaute'))

function onPinInput(event: Event) {
  form.pin = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, PIN_LENGTH)
}
</script>

<template>
  <ShellOnboardingFrame>
    <template #actions>
      <NuxtLink to="/connexion" class="flex items-center gap-1.5 hover:text-ink"
        ><X :size="16" aria-hidden="true" /> Annuler</NuxtLink
      >
    </template>

    <div class="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <form class="rounded-2xl bg-surface p-8 shadow-raised" @submit.prevent="navigateTo('/connexion')">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Nouveau profil</p>
        <h1 class="mt-2 text-[28px] font-semibold">Ajouter un membre d’équipage</h1>
        <p class="mt-1 text-ink-muted">
          Ces informations restent sur l’appareil et servent à calculer la baseline individuelle.
        </p>

        <fieldset class="mt-6">
          <legend class="text-sm font-semibold">Avatar</legend>
          <div class="mt-2 flex flex-wrap gap-3" role="radiogroup" aria-label="Couleur de l’avatar">
            <button
              v-for="color in AVATAR_COLORS"
              :key="color"
              type="button"
              role="radio"
              :aria-checked="form.color === color"
              :aria-label="`Couleur ${color}`"
              class="flex size-14 items-center justify-center rounded-full text-sm font-semibold text-white"
              :class="form.color === color && 'ring-2 ring-primary ring-offset-2'"
              :style="{ background: color }"
              @click="form.color = color"
            >
              {{ initials }}
            </button>
            <button
              type="button"
              class="flex size-14 items-center justify-center rounded-full border border-line text-ink-muted hover:bg-subtle"
              aria-label="Importer une photo"
            >
              <Plus :size="20" aria-hidden="true" />
            </button>
          </div>
        </fieldset>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="text-sm font-semibold">Nom complet</span>
            <span class="relative mt-1.5 block">
              <UserRound
                :size="16"
                class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                v-model="form.name"
                type="text"
                autocomplete="name"
                class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>
          <label class="block">
            <span class="text-sm font-semibold">Identifiant</span>
            <span class="relative mt-1.5 block">
              <Flag
                :size="16"
                class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                v-model="form.code"
                type="text"
                class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>
          <label class="block">
            <span class="text-sm font-semibold">Date de naissance</span>
            <span class="relative mt-1.5 block">
              <CalendarDays
                :size="16"
                class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                v-model="form.birthDate"
                type="date"
                class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>
          <label class="block">
            <span class="text-sm font-semibold">Masse (kg)</span>
            <span class="relative mt-1.5 block">
              <Activity
                :size="16"
                class="absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                v-model.number="form.massKg"
                type="number"
                min="1"
                class="h-11 w-full rounded-lg border border-line pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </span>
          </label>
          <div>
            <p class="text-sm font-semibold">Sexe</p>
            <UiSegmented v-model="form.sex" class="mt-1.5 w-full" :options="SEX_OPTIONS" label="Sexe" />
          </div>
          <div>
            <p class="text-sm font-semibold">Rôle</p>
            <UiSegmented v-model="form.role" class="mt-1.5 w-full" :options="ROLE_OPTIONS" label="Rôle" />
          </div>
        </div>

        <div class="mt-5">
          <label for="new-pin" class="text-sm font-semibold">Code PIN ({{ PIN_LENGTH }} chiffres)</label>
          <div class="mt-1.5 flex items-center justify-between gap-4">
            <div class="relative flex gap-2">
              <span
                v-for="i in PIN_LENGTH"
                :key="i"
                class="flex size-12 items-center justify-center rounded-lg border text-xl"
                :class="i === form.pin.length + 1 ? 'border-2 border-primary' : 'border-line'"
                aria-hidden="true"
              >
                {{ i <= form.pin.length ? '•' : '' }}
              </span>
              <input
                id="new-pin"
                :value="form.pin"
                type="password"
                inputmode="numeric"
                autocomplete="new-password"
                :maxlength="PIN_LENGTH"
                class="absolute inset-0 opacity-0"
                @input="onPinInput"
              />
            </div>
            <span class="text-xs text-ink-muted">À confirmer à l’étape suivante</span>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <UiButton variant="ghost" :icon="ChevronLeft" to="/configuration">Retour</UiButton>
          <UiButton type="submit" :icon="Check" :disabled="form.pin.length !== PIN_LENGTH"
            >Créer le profil</UiButton
          >
        </div>
      </form>

      <aside class="space-y-4" aria-label="Aperçu du profil">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Aperçu</p>
        <div class="rounded-2xl border-2 border-primary bg-surface p-6 text-center shadow-card">
          <span
            class="mx-auto flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white"
            :style="{ background: form.color }"
          >
            {{ initials }}
          </span>
          <p class="mt-3 font-semibold">{{ form.name }}</p>
          <p class="text-sm text-ink-muted">{{ form.code }} · {{ roleLabel }}</p>
          <span
            class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-info-ink"
          >
            <Info :size="13" aria-hidden="true" /> Baseline en cours · 0 / 7 jours
          </span>
        </div>
        <p class="flex items-start gap-2.5 rounded-xl bg-primary-soft p-4 text-sm">
          <Lock :size="16" class="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          Le PIN est stocké sous forme d’empreinte (hash) et n’est jamais transmis au sol.
        </p>
        <p class="flex items-start gap-2.5 rounded-xl bg-accent-soft p-4 text-sm">
          <Sparkles :size="16" class="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          Astro aura besoin de 7 jours de mesures pour établir votre baseline personnelle.
        </p>
      </aside>
    </div>
  </ShellOnboardingFrame>
</template>
