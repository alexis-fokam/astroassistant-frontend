<script setup lang="ts">
import {
  ArrowRight,
  Box,
  CalendarDays,
  RadioTower,
  RefreshCw,
  Search,
  Send,
  Timer,
  WifiOff,
} from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'

/**
 * Page S-01: ground synchronisation centre (spec F10, Figma "S-01 · Centre de synchronisation sol").
 * Store-and-forward: everything is stored on board and sent at each contact window;
 * CRITICAL packets always go first (F10.2).
 */
definePageMeta({ layout: 'app' })
const { t } = useI18n()
useHead({ title: () => t('Synchronisation sol') })
const { exportPacket } = useActions()

// Paquet de synthèse construit à la demande (F10.1) puis placé dans la file d'export.
const building = ref(false)
const buildMessage = ref<{ ok: boolean; text: string } | null>(null)
async function buildPacket() {
  building.value = true
  buildMessage.value = null
  try {
    const saved = await exportPacket()
    if (saved) {
      await refreshNuxtData('screen-sync')
      buildMessage.value = { ok: true, text: t('Paquet de synthèse ajouté à la file d’export.') }
    } else {
      buildMessage.value = {
        ok: false,
        text: t('Mode démonstration : connectez-vous au serveur pour générer un paquet.'),
      }
    }
  } catch (e) {
    buildMessage.value = { ok: false, text: t((e as Error).message) }
  } finally {
    building.value = false
  }
}

const query = ref('')

const { mission } = useMissionData()
const { packets, contactWindows } = await useSyncScreen()

const TIMELINE_HOURS = 30
const NOW_HOURS = 14 + 5 / 60
const toPercent = (hours: number) => `${(hours / TIMELINE_HOURS) * 100}%`
// Une fenêtre courte reste assez large pour son libellé, sans dépasser le bord droit de la frise.
const windowBox = (window: { from: number; to: number }) => {
  const width = Math.max(window.to - window.from, TIMELINE_HOURS * 0.11)
  return { left: toPercent(Math.min(window.from, TIMELINE_HOURS - width)), width: toPercent(width) }
}
const WINDOW_CLASSES = {
  past: 'bg-line text-ink-muted',
  next: 'bg-primary text-white',
  planned: 'border border-dashed border-primary bg-surface text-primary',
}

// Latence aller fixée par la destination de la mission (F10.3), modifiable dans Configuration.
const latency = mission.latencyMin

const matches = (packet: { content: string; sha256: string }) =>
  `${packet.content} ${packet.sha256}`.toLowerCase().includes(query.value.trim().toLowerCase())

const groups = computed(() => [
  {
    title: 'Prioritaires',
    color: LEVEL_HEX.critical,
    packets: packets.value.filter((packet) => packet.level === 'critical' && matches(packet)),
  },
  {
    title: 'Standard',
    color: '#2b6fe6',
    packets: packets.value.filter((packet) => packet.level !== 'critical' && matches(packet)),
  },
])
const COLUMNS = ['Priorité', 'SHA-256', 'Taille', 'Mesuré à bord', 'Reçu au sol']
</script>

<template>
  <div class="space-y-8">
    <UiPageHeader
      title="Synchronisation sol"
      subtitle="Store-and-forward : tout est stocké à bord, puis transmis à chaque fenêtre de contact"
    >
      <template #actions>
        <UiButton variant="secondary" :icon="RefreshCw" :disabled="building" @click="buildPacket">
          {{ t('Générer un paquet') }}
        </UiButton>
        <UiButton
          :icon="Send"
          disabled
          :title="t('Transmission possible seulement pendant une fenêtre de contact')"
        >
          {{ t('Transmettre maintenant') }}
        </UiButton>
      </template>
    </UiPageHeader>

    <section aria-label="Indicateurs" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-divider bg-surface p-5 shadow-card">
        <p class="flex items-center gap-2 text-sm text-ink-muted">
          <CalendarDays :size="17" aria-hidden="true" /> Prochaine fenêtre
        </p>
        <p class="mt-2 font-display text-[28px] leading-tight font-semibold text-primary">
          {{ mission.nextContact }}
        </p>
        <p class="mt-1 text-xs text-ink-muted">Ouverture à 16:19</p>
      </article>
      <DashboardKpiCard label="Durée" :icon="Timer" value="45 min" sub="Débit estimé 256 kb/s" />
      <DashboardKpiCard
        label="Latence aller"
        :icon="RadioTower"
        :value="`${latency} min`"
        :sub="t('Selon la destination de la mission')"
      />
      <DashboardKpiCard label="En file" :icon="Box" :value="String(packets.length)" sub="2,0 Mo compressés" />
    </section>

    <UiCard id="fenetres" title="Fenêtres de contact" :icon="CalendarDays">
      <template #actions>
        <span class="flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1 text-xs text-ink-muted">
          <WifiOff :size="13" aria-hidden="true" /> Hors ligne
        </span>
      </template>
      <div
        class="relative mt-4 h-14 rounded-lg bg-subtle"
        role="img"
        aria-label="Fenêtre passée à 6 h 10, prochaine de 16 h 19 à 17 h 04, suivante demain à 3 h 40"
      >
        <span
          v-for="window in contactWindows"
          :key="window.label"
          class="absolute inset-y-2 flex items-center justify-center overflow-hidden rounded-md px-2 text-xs font-medium whitespace-nowrap"
          :class="WINDOW_CLASSES[window.state]"
          :style="windowBox(window)"
        >
          {{ window.label }}
        </span>
        <span class="absolute -inset-y-3 w-0.5 bg-brand-violet" :style="{ left: toPercent(NOW_HOURS) }">
          <span class="absolute -top-4 -left-4 text-[10px] font-semibold text-brand-violet">14:05</span>
        </span>
      </div>
      <div class="mt-2 flex justify-between text-xs text-ink-muted">
        <span>J+142 00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>J+143 00:00</span
        ><span>06:00</span>
      </div>
      <div
        class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4 text-sm"
      >
        <span class="text-ink-muted">
          {{ t('Latence aller actuelle : {n} min, fixée par la destination de la mission.', { n: latency }) }}
        </span>
        <UiButton variant="ghost" size="sm" :icon-right="ArrowRight" to="/configuration">
          {{ t('Changer la destination') }}
        </UiButton>
      </div>
    </UiCard>

    <p
      v-if="buildMessage"
      class="rounded-lg px-4 py-2 text-sm"
      :class="buildMessage.ok ? 'bg-nominal-soft text-nominal-ink' : 'bg-warning-soft text-warning-ink'"
      role="status"
    >
      {{ buildMessage.text }}
    </p>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-56 flex-1">
        <Search
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <label for="packet-search" class="sr-only">{{ t('Rechercher un paquet') }}</label>
        <input
          id="packet-search"
          v-model="query"
          type="search"
          :placeholder="t('Rechercher un paquet, une empreinte…')"
          class="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>
      <span class="text-xs text-ink-muted">{{ t('CRITICAL toujours en tête de file (F10.2)') }}</span>
    </div>

    <BoardGroup
      v-for="group in groups"
      :id="group.title === 'Standard' ? 'paquets' : undefined"
      :key="group.title"
      :title="group.title"
      :count="`${group.packets.length} paquets`"
      :color="group.color"
    >
      <thead>
        <tr class="border-b border-divider text-xs text-ink-muted">
          <th scope="col" class="px-4 py-2.5 text-left font-medium">Contenu</th>
          <th v-for="column in COLUMNS" :key="column" scope="col" class="px-4 py-2.5 text-center font-medium">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="packet in group.packets" :key="packet.id" class="border-b border-divider last:border-0">
          <th scope="row" class="px-4 py-2 text-left font-medium">{{ packet.content }}</th>
          <td class="w-40 px-1 py-1"><BoardStatusCell :level="packet.level" /></td>
          <td class="px-4 py-2 text-center font-mono text-xs">{{ packet.sha256 }}</td>
          <td class="px-4 py-2 text-center tabular">{{ packet.size }}</td>
          <td class="px-4 py-2 text-center text-ink-muted">{{ packet.createdAt }}</td>
          <td class="px-4 py-2 text-center text-ink-muted">{{ packet.receivedAt ?? '—' }}</td>
        </tr>
      </tbody>
    </BoardGroup>
  </div>
</template>
