<script setup lang="ts">
import { Bell, ChevronRight, Inbox, Siren, TriangleAlert } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { NotificationItem } from '~/composables/useScreens'

/**
 * Centre de notifications : alertes du moteur IA encore ouvertes, messages du sol et
 * urgences, du plus récent au plus ancien. Chaque ligne mène à l'écran concerné.
 * Rafraîchi toutes les 10 s pour suivre la démo en direct.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Notifications') })

const { items, live } = await useNotificationsScreen()

type Filter = 'all' | NotificationItem['kind']
const filter = ref<Filter>('all')
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'alert', label: 'Alertes' },
  { value: 'message', label: 'Messages du sol' },
  { value: 'emergency', label: 'Urgences' },
]
const ICONS: Record<NotificationItem['kind'], Component> = {
  alert: TriangleAlert,
  message: Inbox,
  emergency: Siren,
}
const KIND_LABELS: Record<NotificationItem['kind'], string> = {
  alert: 'Alerte du moteur IA',
  message: 'Message du sol',
  emergency: 'Urgence',
}

const counts = computed(() => ({
  all: items.value.length,
  alert: items.value.filter((i) => i.kind === 'alert').length,
  message: items.value.filter((i) => i.kind === 'message').length,
  emergency: items.value.filter((i) => i.kind === 'emergency').length,
}))
const shown = computed(() =>
  filter.value === 'all' ? items.value : items.value.filter((i) => i.kind === filter.value),
)
const unread = computed(() => items.value.filter((i) => i.unread).length)

let poller: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (live.value) poller = setInterval(() => refreshNuxtData('screen-notifications'), 10_000)
})
onBeforeUnmount(() => clearInterval(poller))
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8">
    <UiPageHeader
      :title="t('Notifications')"
      :subtitle="t('{n} non lues · alertes du moteur IA, messages du sol et urgences', { n: unread })"
    />

    <div class="flex flex-wrap gap-2" role="tablist" :aria-label="t('Filtrer les notifications')">
      <button
        v-for="option in FILTERS"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="filter === option.value"
        class="flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
        :class="
          filter === option.value
            ? 'border-primary bg-primary text-white'
            : 'border-line bg-surface text-ink-muted hover:text-ink'
        "
        @click="filter = option.value"
      >
        {{ t(option.label) }}
        <span
          class="rounded-full px-1.5 text-xs tabular"
          :class="filter === option.value ? 'bg-white/20' : 'bg-subtle'"
          >{{ counts[option.value] }}</span
        >
      </button>
    </div>

    <UiCard :padded="false">
      <div v-if="shown.length === 0" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span class="flex size-12 items-center justify-center rounded-2xl bg-nominal-soft text-nominal-ink">
          <Bell :size="22" aria-hidden="true" />
        </span>
        <p class="font-semibold">{{ t('Aucune notification') }}</p>
        <p class="max-w-sm text-sm text-ink-muted">
          {{ t('Le moteur IA vous préviendra ici dès qu’une mesure sort de la normale.') }}
        </p>
      </div>
      <ul v-else class="divide-y divide-divider">
        <li v-for="item in shown" :key="item.key">
          <NuxtLink
            :to="item.to"
            class="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-subtle"
            :class="item.unread ? 'bg-primary-soft/40' : ''"
          >
            <span
              class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl"
              :class="{
                'bg-critical-soft text-critical-ink': item.level === 'critical',
                'bg-warning-soft text-warning-ink': item.level === 'warning',
                'bg-info-soft text-info-ink': item.level === 'info' || item.level === 'nominal',
              }"
            >
              <component :is="ICONS[item.kind]" :size="18" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-medium text-ink-muted">{{ t(KIND_LABELS[item.kind]) }}</span>
                <UiStatusBadge v-if="item.kind !== 'message'" :level="item.level" />
                <span v-if="item.unread" class="size-2 rounded-full bg-primary" :aria-label="t('Non lu')" />
              </span>
              <span class="mt-1 block font-semibold">{{ t(item.title) }}</span>
              <span class="mt-0.5 block truncate text-sm text-ink-muted">{{ item.detail }}</span>
            </span>
            <span class="flex shrink-0 flex-col items-end gap-1 text-xs text-ink-muted">
              <span class="tabular">{{ item.stamp }}</span>
              <span>{{ item.ago }}</span>
              <ChevronRight :size="16" class="mt-1 text-ink-faint" aria-hidden="true" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
