<script setup lang="ts">
import { Archive, Layers, ListChecks, Search, Siren, TriangleAlert } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ArchiveItem } from '~/composables/useScreens'

/**
 * Archives du médecin de bord : alertes résolues, protocoles terminés ou interrompus,
 * urgences clôturées et simulations passées. Recherche plein texte, filtre par type et
 * par astronaute.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Archives') })

const { items } = await useArchivesScreen()
const { crew } = useMissionData()

type Kind = 'all' | ArchiveItem['kind']
const kind = ref<Kind>('all')
const member = ref('all')
const query = ref('')

const KINDS: { value: Kind; label: string; icon: Component }[] = [
  { value: 'all', label: 'Tout', icon: Archive },
  { value: 'alert', label: 'Alertes résolues', icon: TriangleAlert },
  { value: 'protocol', label: 'Protocoles', icon: ListChecks },
  { value: 'emergency', label: 'Urgences', icon: Siren },
  { value: 'simulation', label: 'Simulations', icon: Layers },
]
const ICONS = Object.fromEntries(KINDS.map((k) => [k.value, k.icon])) as Record<Kind, Component>

const shown = computed(() => {
  const words = query.value.trim().toLowerCase()
  return items.value.filter(
    (item) =>
      (kind.value === 'all' || item.kind === kind.value) &&
      (member.value === 'all' || item.crew === member.value) &&
      (!words ||
        `${item.title} ${item.detail} ${item.status} ${item.crew ?? ''}`.toLowerCase().includes(words)),
  )
})
const countOf = (value: Kind) =>
  value === 'all' ? items.value.length : items.value.filter((i) => i.kind === value).length
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Archives')"
      :subtitle="t('Historique de la mission : alertes résolues, protocoles, urgences et simulations')"
    />

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-64 flex-1">
        <Search
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label for="archive-search" class="sr-only">{{ t('Rechercher dans les archives') }}</label>
        <input
          id="archive-search"
          v-model="query"
          type="search"
          :placeholder="t('Rechercher une alerte, un protocole, un astronaute…')"
          class="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>
      <label for="archive-member" class="sr-only">{{ t('Astronaute') }}</label>
      <select
        id="archive-member"
        v-model="member"
        class="h-11 rounded-xl border border-line bg-surface px-3 text-sm"
      >
        <option value="all">{{ t('Tout l’équipage') }}</option>
        <option v-for="m in crew" :key="m.code" :value="m.code">
          {{ m.code }} · {{ m.firstName }} {{ m.lastName }}
        </option>
      </select>
    </div>

    <div class="flex flex-wrap gap-2" role="tablist" :aria-label="t('Type d’archive')">
      <button
        v-for="option in KINDS"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="kind === option.value"
        class="flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
        :class="
          kind === option.value
            ? 'border-primary bg-primary text-white'
            : 'border-line bg-surface text-ink-muted hover:text-ink'
        "
        @click="kind = option.value"
      >
        <component :is="option.icon" :size="15" aria-hidden="true" />
        {{ t(option.label) }}
        <span
          class="rounded-full px-1.5 text-xs tabular"
          :class="kind === option.value ? 'bg-white/20' : 'bg-subtle'"
        >
          {{ countOf(option.value) }}
        </span>
      </button>
    </div>

    <UiCard :padded="false">
      <p v-if="shown.length === 0" class="px-6 py-16 text-center text-sm text-ink-muted">
        {{ t('Aucune archive ne correspond à votre recherche.') }}
      </p>
      <ul v-else class="divide-y divide-divider">
        <li v-for="item in shown" :key="item.key" class="flex flex-wrap items-start gap-4 px-6 py-5">
          <span
            class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink-muted"
          >
            <component :is="ICONS[item.kind]" :size="18" aria-hidden="true" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold">{{ t(item.title) }}</p>
              <UiStatusBadge v-if="item.kind !== 'simulation'" :level="item.level" />
              <NuxtLink
                v-if="item.crew"
                :to="`/cmo/equipage/${item.crew}`"
                class="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary hover:underline"
              >
                {{ item.crew }}
              </NuxtLink>
            </div>
            <p class="mt-1 text-sm text-ink-muted">{{ t(item.detail) }}</p>
            <p class="mt-1 text-xs text-ink-muted">{{ t(item.status) }}</p>
          </div>
          <dl class="grid shrink-0 grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-xs text-ink-muted">
            <dt>{{ t('Début') }}</dt>
            <dd class="text-right text-ink tabular">{{ item.start }}</dd>
            <dt>{{ t('Fin') }}</dt>
            <dd class="text-right text-ink tabular">{{ item.end }}</dd>
          </dl>
        </li>
      </ul>
    </UiCard>
  </div>
</template>
