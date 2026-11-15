<script setup lang="ts">
import {
  ArrowUpDown,
  BookOpen,
  Box,
  Filter,
  Layers,
  OctagonAlert,
  Plus,
  Search,
  Timer,
  TriangleAlert,
  UserRound,
} from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import type { InventoryRow } from '~/mocks/inventory'

/**
 * Page M-06: on-board pharmacy (spec F11, Figma "M-06 · Pharmacie & kit médical").
 * Low-stock and expiry alerts (F11.1); the usage register is CMO-only (F11.3).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Pharmacie de bord' })

const { inventory, summary } = await usePharmacyScreen()

const kit = ref('all')
const KITS = [
  { value: 'all', label: 'Tout' },
  { value: 'urgence', label: 'Kit urgence' },
  { value: 'module-b', label: 'Module B' },
]

const visible = computed(() => inventory.value.filter((row) => kit.value === 'all' || row.kit === kit.value))

const groups = computed(() =>
  (
    [
      { key: 'restock', title: 'À réapprovisionner', color: LEVEL_HEX.critical },
      { key: 'expiring', title: 'Péremption proche', color: LEVEL_HEX.warning },
      { key: 'ok', title: 'En stock', color: '#00a35c' },
    ] as const
  ).map((group) => {
    const rows = visible.value.filter((row) => row.group === group.key)
    const count =
      group.key === 'ok'
        ? `${summary.value.inStock} articles · ${rows.length} affichés`
        : `${rows.length} article${rows.length > 1 ? 's' : ''}`
    return { ...group, rows, count }
  }),
)

const COLUMNS = ['Quantité', 'Péremption', 'Emplacement', 'Statut']

function barClass(row: InventoryRow) {
  return row.group === 'restock' ? 'bg-warning' : 'bg-brand-blue'
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Pharmacie de bord"
      subtitle="Inventaire embarqué · registre des usages réservé au médecin de bord"
    >
      <template #actions
        ><UiButton variant="secondary" :icon="BookOpen">Registre des usages</UiButton></template
      >
    </UiPageHeader>

    <section aria-label="Indicateurs" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard label="Articles suivis" :icon="Box" :value="String(summary.tracked)" />
      <DashboardKpiCard
        label="Stock bas"
        :icon="TriangleAlert"
        :value="String(summary.lowStock)"
        level="warning"
      />
      <DashboardKpiCard
        label="Péremption < 60 j"
        :icon="Timer"
        :value="String(summary.expiringSoon)"
        level="warning"
      />
      <DashboardKpiCard
        label="Ruptures"
        :icon="OctagonAlert"
        :value="String(summary.outOfStock)"
        level="critical"
      />
    </section>

    <div class="flex flex-wrap items-center gap-1">
      <UiButton size="sm" :icon="Plus">Ajouter un article</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Search">Rechercher</UiButton>
      <UiButton variant="ghost" size="sm" :icon="UserRound">Membre</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Filter">Filtrer</UiButton>
      <UiButton variant="ghost" size="sm" :icon="ArrowUpDown">Trier</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Layers">Grouper par</UiButton>
      <UiSegmented v-model="kit" class="ml-auto" :options="KITS" size="sm" label="Emplacement" />
    </div>

    <BoardGroup
      v-for="group in groups"
      :key="group.key"
      :title="group.title"
      :count="group.count"
      :color="group.color"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th scope="col" class="px-4 py-2.5 text-left font-medium">Article</th>
          <th v-for="column in COLUMNS" :key="column" scope="col" class="px-4 py-2.5 text-center font-medium">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in group.rows" :key="row.code" class="border-b border-divider last:border-0">
          <th scope="row" class="px-4 py-2 text-left font-medium">{{ row.name }}</th>
          <td class="w-40 px-3 py-2">
            <span class="flex justify-between text-sm">
              <span class="font-semibold tabular">{{ row.quantity }}</span>
              <span class="text-xs text-ink-muted">/ {{ row.capacity }}</span>
            </span>
            <UiProgress
              class="mt-1"
              :value="(row.quantity / row.capacity) * 100"
              :height="4"
              :bar-class="barClass(row)"
              :label="`Stock ${row.name}`"
            />
          </td>
          <td
            class="px-4 py-2 text-center whitespace-nowrap"
            :class="row.expiresInDays !== undefined && 'font-semibold text-warning-ink'"
          >
            {{ row.expiry ?? '—' }}<template v-if="row.expiresInDays"> · J+{{ row.expiresInDays }}</template>
          </td>
          <td class="px-4 py-2 text-center whitespace-nowrap">{{ row.location }}</td>
          <td class="w-40 px-1 py-1">
            <BoardStatusCell :level="row.status.level" :label="row.status.label" />
          </td>
        </tr>
      </tbody>
    </BoardGroup>
  </div>
</template>
