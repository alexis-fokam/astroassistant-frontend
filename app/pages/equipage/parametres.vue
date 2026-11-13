<script setup lang="ts">
import { Bell, Check, CircleCheck, Database, Eye, Globe, Lock, Sun, UserRound } from 'lucide-vue-next'

/**
 * Page E-18: profile settings (spec §7, §11, Figma "E-18 · Paramètres").
 * The app ships with the light theme only; dark and automatic themes are shown as upcoming.
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Paramètres' })

const SECTIONS = [
  { id: 'profile', label: 'Profil', icon: UserRound },
  { id: 'notifications', label: 'Notifications & rappels', icon: Bell },
  { id: 'appearance', label: 'Apparence', icon: Sun },
  { id: 'accessibility', label: 'Accessibilité', icon: Eye },
  { id: 'language', label: 'Langue', icon: Globe },
  { id: 'security', label: 'Sécurité & PIN', icon: Lock },
  { id: 'data', label: 'Données', icon: Database },
]
const activeSection = ref('appearance')

const THEMES = [
  { id: 'light', label: 'Clair', hint: 'Environnements lumineux', available: true },
  { id: 'dark', label: 'Sombre cockpit', hint: 'Faible éclairage', available: false },
  { id: 'auto', label: 'Automatique', hint: 'Suit le cycle jour/nuit', available: false },
]

const textSize = ref('large')
const TEXT_SIZES = [
  { value: 'normal', label: 'A' },
  { value: 'large', label: 'A+' },
  { value: 'larger', label: 'A++' },
]
const display = reactive({ reduceMotion: false, highContrast: true, tabularFigures: true })
const reminders = reactive({ hydration: true, pendingProtocols: true })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Paramètres" subtitle="Préférences du profil AV-02 · enregistrées sur cet appareil" />

    <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Sections des paramètres">
        <ul class="space-y-1">
          <li v-for="section in SECTIONS" :key="section.id">
            <button
              type="button"
              class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors"
              :class="
                activeSection === section.id
                  ? 'bg-primary-soft font-medium text-primary'
                  : 'text-ink-muted hover:bg-subtle hover:text-ink'
              "
              :aria-current="activeSection === section.id ? 'page' : undefined"
              @click="activeSection = section.id"
            >
              <component :is="section.icon" :size="17" aria-hidden="true" />
              {{ section.label }}
            </button>
          </li>
        </ul>
      </nav>

      <div class="space-y-5">
        <UiCard
          title="Thème"
          subtitle="Le thème clair est actif ; les autres arriveront plus tard"
          :icon="Sun"
        >
          <div class="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Thème">
            <button
              v-for="theme in THEMES"
              :key="theme.id"
              type="button"
              role="radio"
              :aria-checked="theme.id === 'light'"
              :disabled="!theme.available"
              class="rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="theme.id === 'light' ? 'border-2 border-primary' : 'border-line'"
            >
              <span
                class="block h-20 rounded-lg border border-divider p-2"
                :class="
                  theme.id === 'dark'
                    ? 'bg-ink'
                    : theme.id === 'auto'
                      ? 'bg-gradient-to-r from-subtle from-50% to-ink to-50%'
                      : 'bg-subtle'
                "
              >
                <span class="block h-3 rounded bg-surface/80" />
                <span class="mt-2 block h-9 rounded bg-surface/80" />
              </span>
              <span class="mt-3 flex items-center justify-between text-sm font-semibold">
                {{ theme.label }}
                <CircleCheck v-if="theme.id === 'light'" :size="16" class="text-primary" aria-hidden="true" />
                <span
                  v-else-if="!theme.available"
                  class="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-muted"
                  >Bientôt</span
                >
              </span>
              <span class="block text-xs text-ink-muted">{{ theme.hint }}</span>
            </button>
          </div>
        </UiCard>

        <UiCard title="Affichage" :icon="Eye">
          <ul class="divide-y divide-divider">
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Taille du texte</span>
                <span class="block text-xs text-ink-muted">Agrandit les constantes et les libellés</span>
              </span>
              <UiSegmented v-model="textSize" :options="TEXT_SIZES" size="sm" label="Taille du texte" />
            </li>
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Réduire les animations</span>
                <span class="block text-xs text-ink-muted"
                  >Respecte prefers-reduced-motion (pulsations, minuteur)</span
                >
              </span>
              <UiSwitch v-model="display.reduceMotion" label="Réduire les animations" />
            </li>
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Contraste renforcé</span>
                <span class="block text-xs text-ink-muted">Bordures et textes plus marqués</span>
              </span>
              <UiSwitch v-model="display.highContrast" label="Contraste renforcé" />
            </li>
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Chiffres tabulaires</span>
                <span class="block text-xs text-ink-muted">Aligne les valeurs des constantes</span>
              </span>
              <UiSwitch v-model="display.tabularFigures" label="Chiffres tabulaires" />
            </li>
          </ul>
        </UiCard>

        <UiCard title="Rappels" :icon="Bell">
          <ul class="divide-y divide-divider">
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Check-in quotidien</span>
                <span class="block text-xs text-ink-muted">Rappel à 08:00, relance à 09:00</span>
              </span>
              <label class="sr-only" for="checkin-time">Heure du rappel de check-in</label>
              <input
                id="checkin-time"
                type="time"
                value="08:00"
                class="h-9 rounded-full bg-subtle px-3 text-sm"
              />
            </li>
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Hydratation</span>
                <span class="block text-xs text-ink-muted">Toutes les 45 minutes pendant l’éveil</span>
              </span>
              <UiSwitch v-model="reminders.hydration" label="Rappels d’hydratation" />
            </li>
            <li class="flex items-center justify-between gap-4 py-3.5">
              <span>
                <span class="block text-sm font-semibold">Protocoles en attente</span>
                <span class="block text-xs text-ink-muted"
                  >Notification si une étape n’est pas faite en 30 min</span
                >
              </span>
              <UiSwitch v-model="reminders.pendingProtocols" label="Rappels des protocoles en attente" />
            </li>
          </ul>
        </UiCard>

        <div class="flex gap-3">
          <UiButton :icon="Check">Enregistrer</UiButton>
          <UiButton variant="ghost">Annuler</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
