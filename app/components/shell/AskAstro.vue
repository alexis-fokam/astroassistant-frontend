<script setup lang="ts">
/**
 * Panneau « Expliquer mon statut » : l'astronaute connecté voit pourquoi le moteur IA
 * d'Astro Assistant l'a classé ainsi (règle déclenchée, facteurs principaux, score
 * d'anomalie) et le protocole recommandé. Tout vient de notre propre moteur, à bord :
 * aucune IA généraliste, aucun appel réseau vers un service externe.
 */
import { ArrowRight, Sparkles, X } from 'lucide-vue-next'

const open = ref(false)
const BORDERS = {
  critical: 'border-critical/40 bg-critical-soft/40',
  warning: 'border-warning/50 bg-warning-soft/40',
  info: 'border-info/40',
  nominal: 'border-divider',
} as const
const { t } = useI18n()
const { currentCrew, alerts, source, currentExplanation, findProtocol } = useMissionData()

// Alerte la plus grave encore ouverte pour l'astronaute connecté.
const ownAlert = computed(() => {
  const mine = alerts.filter((a) => a.crew === currentCrew.code && a.status !== 'resolved')
  return (
    mine.find((a) => a.level === 'critical') ?? mine.find((a) => a.level === 'warning') ?? mine[0] ?? null
  )
})
const protocol = computed(() =>
  ownAlert.value?.protocol ? findProtocol(ownAlert.value.protocol) : undefined,
)
// En mode connecté, l'explication détaillée n'existe que si le moteur a levé une alerte.
const explanation = computed(() => (source !== 'api' || ownAlert.value ? currentExplanation : null))

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
    <button
      v-if="!open"
      type="button"
      class="pointer-events-auto flex h-12 items-center gap-2.5 rounded-full border border-divider bg-surface px-5 text-sm font-medium text-ink-muted shadow-raised transition hover:-translate-y-0.5 hover:text-ink"
      :aria-expanded="open"
      @click="open = true"
    >
      <Sparkles :size="18" class="text-accent" aria-hidden="true" />
      {{ t('Expliquer mon statut') }}
    </button>

    <div
      v-else
      role="dialog"
      :aria-label="t('Expliquer mon statut')"
      class="pointer-events-auto max-h-[80dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-divider bg-surface p-5 shadow-raised"
    >
      <div class="flex items-center justify-between gap-3">
        <span class="flex items-center gap-2 text-sm font-semibold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Sparkles :size="16" class="text-white" aria-hidden="true" />
          </span>
          {{ t('Pourquoi ce statut ?') }}
          <span class="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
            {{ t('Moteur IA embarqué') }}
          </span>
        </span>
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-subtle"
          :aria-label="t('Fermer')"
          @click="open = false"
        >
          <X :size="18" aria-hidden="true" />
        </button>
      </div>

      <div class="mt-4 flex items-center gap-3 rounded-xl bg-subtle p-3">
        <UiAvatar :initials="currentCrew.initials" :tone="currentCrew.tone" :size="36" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">{{ currentCrew.firstName }} {{ currentCrew.lastName }}</p>
          <p class="text-xs text-ink-muted">{{ t('Score global {n} / 100', { n: currentCrew.score }) }}</p>
        </div>
        <UiStatusBadge :level="currentCrew.level" size="md" />
      </div>

      <template v-if="ownAlert">
        <div class="mt-4 rounded-xl border p-4" :class="BORDERS[ownAlert.level]">
          <p class="text-sm font-semibold">{{ t(ownAlert.title) }}</p>
          <p class="mt-1 text-sm text-ink-muted">{{ t(ownAlert.detail) }}</p>
        </div>
        <div v-if="explanation" class="mt-4">
          <DashboardAlertExplanation v-bind="explanation" />
        </div>
        <UiButton
          v-if="ownAlert.protocol"
          class="mt-4 w-full"
          :to="`/equipage/protocoles/${ownAlert.protocol}`"
          :icon-right="ArrowRight"
          @click="open = false"
        >
          {{ t('Suivre le protocole {code}', { code: protocol?.title ?? ownAlert.protocol }) }}
        </UiButton>
      </template>
      <p v-else class="mt-4 text-sm text-ink-muted">
        {{
          t(
            'Aucune alerte ouverte : vos mesures restent dans votre plage habituelle. Le moteur réévalue votre statut toutes les 5 secondes.',
          )
        }}
      </p>
      <p class="mt-4 text-xs text-ink-faint">
        {{ t('Analyse calculée à bord par les règles cliniques et l’Isolation Forest, sans connexion.') }}
      </p>
    </div>
  </div>
</template>
