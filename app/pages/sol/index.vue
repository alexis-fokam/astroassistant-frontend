<script setup lang="ts">
import {
  ArrowUpDown,
  Box,
  CalendarDays,
  Filter,
  Layers,
  RadioTower,
  RefreshCw,
  Search,
  Send,
  Timer,
  UserRound,
  WifiOff,
} from 'lucide-vue-next'
import { LEVEL_HEX } from '~/constants/levels'

/**
 * Page S-01: ground synchronisation centre (spec F10, Figma "S-01 · Centre de synchronisation sol").
 * Store-and-forward: everything is stored on board and sent at each contact window;
 * CRITICAL packets always go first (F10.2).
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Synchronisation sol' })

const { mission } = useMissionData()
const { packets, contactWindows } = await useSyncScreen()

const TIMELINE_HOURS = 30
const NOW_HOURS = 14 + 5 / 60
const toPercent = (hours: number) => `${(hours / TIMELINE_HOURS) * 100}%`
const WINDOW_CLASSES = {
  past: 'bg-line text-ink-muted',
  next: 'bg-primary text-white',
  planned: 'border border-dashed border-primary bg-surface text-primary',
}

// One-way latency, simulated between 4 and 22 minutes (spec F10.3).
const latency = ref(mission.latencyMin)

const groups = computed(() => [
  {
    title: 'Prioritaires',
    color: LEVEL_HEX.critical,
    packets: packets.value.filter((packet) => packet.level === 'critical'),
  },
  {
    title: 'Standard',
    color: '#2b6fe6',
    packets: packets.value.filter((packet) => packet.level !== 'critical'),
  },
])
const COLUMNS = ['Priorité', 'SHA-256', 'Taille', 'Mesuré à bord', 'Reçu au sol']
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Synchronisation sol"
      subtitle="Store-and-forward : tout est stocké à bord, puis transmis à chaque fenêtre de contact"
    >
      <template #actions>
        <UiButton variant="secondary" :icon="RefreshCw">Générer un paquet</UiButton>
        <UiButton :icon="Send" disabled>Transmettre maintenant</UiButton>
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
        sub="Simulée (4 à 22 min)"
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
          class="absolute inset-y-2 flex items-center justify-center rounded-md text-xs font-medium whitespace-nowrap"
          :class="WINDOW_CLASSES[window.state]"
          :style="{ left: toPercent(window.from), width: toPercent(Math.max(window.to - window.from, 2.2)) }"
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
      <div class="mt-4 flex items-center gap-4">
        <span class="text-sm text-ink-muted">Latence simulée</span>
        <UiSlider
          v-model="latency"
          class="flex-1"
          :min="4"
          :max="22"
          label="Latence simulée"
          :value-text="`${latency} minutes`"
        />
        <span class="w-14 text-right text-sm font-semibold tabular">{{ latency }} min</span>
      </div>
    </UiCard>

    <div class="flex flex-wrap items-center gap-1">
      <UiButton variant="ghost" size="sm" :icon="Search">Rechercher</UiButton>
      <UiButton variant="ghost" size="sm" :icon="UserRound">Membre</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Filter">Filtrer</UiButton>
      <UiButton variant="ghost" size="sm" :icon="ArrowUpDown">Trier</UiButton>
      <UiButton variant="ghost" size="sm" :icon="Layers">Grouper par</UiButton>
      <span class="ml-auto text-xs text-ink-muted">CRITICAL toujours en tête de file (F10.2)</span>
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
