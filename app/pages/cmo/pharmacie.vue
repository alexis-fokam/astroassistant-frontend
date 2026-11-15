<script setup lang="ts">
import { BookOpen, Box, OctagonAlert, Search, Timer, TriangleAlert, X } from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'
import type { InventoryRow } from '~/mocks/inventory'

/**
 * Page M-06 : pharmacie de bord (F11, Figma « M-06 »).
 * Alertes de stock bas et de péremption (F11.1), recherche, filtre par emplacement, et
 * registre des usages réservé au médecin de bord (F11.3) : chaque usage décrémente le stock.
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Pharmacie de bord') })

const { inventory, summary } = await usePharmacyScreen()
const { crew } = useMissionData()
const { recordUsage, live } = useActions()

const query = ref('')

// ------------------------------------------------------------------ registre des usages
const showUsage = ref(false)
const usage = reactive({ item: '', quantity: 1, patient: '', note: '' })
const usageMessage = ref<{ ok: boolean; text: string } | null>(null)
const saving = ref(false)
async function submitUsage() {
  if (!usage.item || usage.quantity <= 0) return
  saving.value = true
  usageMessage.value = null
  try {
    const saved = await recordUsage(usage.item, usage.quantity, usage.patient, usage.note)
    if (saved) {
      await refreshNuxtData('screen-pharmacy')
      usageMessage.value = { ok: true, text: t('Usage enregistré : le stock est mis à jour.') }
      usage.quantity = 1
      usage.note = ''
    } else {
      usageMessage.value = {
        ok: false,
        text: t('Mode démonstration : connectez-vous au serveur pour enregistrer un usage.'),
      }
    }
  } catch (e) {
    usageMessage.value = { ok: false, text: t((e as Error).message) }
  } finally {
    saving.value = false
  }
}

const kit = ref('all')
const KITS = [
  { value: 'all', label: 'Tout' },
  { value: 'urgence', label: 'Kit urgence' },
  { value: 'module-b', label: 'Module B' },
]

const visible = computed(() => {
  const words = query.value.trim().toLowerCase()
  return inventory.value.filter(
    (row) =>
      (kit.value === 'all' || row.kit === kit.value) &&
      (!words || `${row.name} ${row.code} ${row.location}`.toLowerCase().includes(words)),
  )
})

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
  <div class="space-y-8">
    <UiPageHeader
      :title="t('Pharmacie de bord')"
      :subtitle="t('Inventaire embarqué · registre des usages réservé au médecin de bord')"
    >
      <template #actions>
        <UiButton variant="secondary" :icon="showUsage ? X : BookOpen" @click="showUsage = !showUsage">
          {{ t(showUsage ? 'Fermer le registre' : 'Enregistrer un usage') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <UiCard v-if="showUsage" :title="t('Registre des usages')" :icon="BookOpen">
      <form
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_0.7fr_1fr_2fr_auto] lg:items-end"
        @submit.prevent="submitUsage"
      >
        <label class="block">
          <span class="text-sm font-semibold">{{ t('Article') }}</span>
          <select
            v-model="usage.item"
            required
            class="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option value="" disabled>{{ t('Choisir un article') }}</option>
            <option v-for="row in inventory" :key="row.code" :value="row.code">
              {{ row.name }} ({{ row.quantity }})
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-semibold">{{ t('Quantité') }}</span>
          <input
            v-model.number="usage.quantity"
            type="number"
            min="1"
            step="1"
            required
            class="mt-1.5 h-11 w-full rounded-lg border border-line px-3 text-sm"
          />
        </label>
        <label class="block">
          <span class="text-sm font-semibold">{{ t('Patient') }}</span>
          <select
            v-model="usage.patient"
            class="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm"
          >
            <option value="">—</option>
            <option v-for="m in crew" :key="m.code" :value="m.code">{{ m.code }} · {{ m.firstName }}</option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-semibold">{{ t('Note') }}</span>
          <input
            v-model="usage.note"
            type="text"
            maxlength="200"
            class="mt-1.5 h-11 w-full rounded-lg border border-line px-3 text-sm"
          />
        </label>
        <UiButton type="submit" :disabled="saving || !usage.item">{{ t('Enregistrer') }}</UiButton>
      </form>
      <p
        v-if="usageMessage"
        class="mt-4 rounded-lg px-3 py-2 text-sm"
        :class="usageMessage.ok ? 'bg-nominal-soft text-nominal-ink' : 'bg-warning-soft text-warning-ink'"
        role="status"
      >
        {{ usageMessage.text }}
      </p>
      <p v-if="!live()" class="mt-3 text-xs text-ink-muted">
        {{ t('Réservé au médecin de bord connecté.') }}
      </p>
    </UiCard>

    <section :aria-label="t('Indicateurs')" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-56 flex-1">
        <Search
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label for="pharmacy-search" class="sr-only">{{ t('Rechercher un article') }}</label>
        <input
          id="pharmacy-search"
          v-model="query"
          type="search"
          :placeholder="t('Rechercher un médicament, un emplacement…')"
          class="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>
      <UiSegmented v-model="kit" :options="KITS" size="sm" :label="t('Emplacement')" />
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
