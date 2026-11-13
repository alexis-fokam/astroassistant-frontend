<script setup lang="ts">
import { Brain, Code, Cpu, Download, RadioTower, Zap } from 'lucide-vue-next'

/**
 * Page D-03: live engine log and useful API routes for the demo
 * (spec F15, §10, Figma "D-03 · Journal moteur & API").
 */
definePageMeta({ layout: 'app' })
useHead({ title: 'Journal moteur' })

type LogLevel = 'CRIT' | 'WARN' | 'INFO' | 'NOMI'
type LogTopic = 'alerts' | 'ai' | 'sync' | 'other'

const LOG: { time: string; level: LogLevel; event: string; detail: string; topic: LogTopic }[] = [
  {
    time: '14:05:32.418',
    level: 'CRIT',
    event: 'alert.created',
    detail: 'AV-02 radiation CRITICAL rule=RAD-SPE-01',
    topic: 'alerts',
  },
  {
    time: '14:05:31.902',
    level: 'INFO',
    event: 'ws.push',
    detail: 'telemetry batch=24 clients=4 latency=38ms',
    topic: 'sync',
  },
  {
    time: '14:05:31.860',
    level: 'INFO',
    event: 'engine.infer',
    detail: 'isolation_forest n=6 · 41 ms',
    topic: 'ai',
  },
  {
    time: '14:05:31.811',
    level: 'WARN',
    event: 'score.update',
    detail: 'AV-02 behavioral=68 global=54',
    topic: 'ai',
  },
  {
    time: '14:05:30.004',
    level: 'INFO',
    event: 'vitals.ingest',
    detail: 'batch=24 rejected=0',
    topic: 'other',
  },
  {
    time: '14:05:20.551',
    level: 'INFO',
    event: 'sim.scenario',
    detail: 'S3 injected seed=42 speed=×240',
    topic: 'other',
  },
  {
    time: '14:04:58.120',
    level: 'NOMI',
    event: 'protocol.run',
    detail: 'PRT-STRESS-01 step=1 done',
    topic: 'alerts',
  },
  {
    time: '14:04:41.337',
    level: 'INFO',
    event: 'sync.queue',
    detail: 'packet 5be2…77d1 priority=CRITICAL',
    topic: 'sync',
  },
  {
    time: '14:04:30.002',
    level: 'INFO',
    event: 'scheduler.tick',
    detail: 'pipeline run #8 812 · 64 ms',
    topic: 'ai',
  },
  {
    time: '14:04:12.890',
    level: 'NOMI',
    event: 'checkin.submit',
    detail: 'AV-04 duration=71s',
    topic: 'other',
  },
]

// Badge colours on the dark console background.
const LEVEL_BADGE: Record<LogLevel, string> = {
  CRIT: 'bg-critical/30 text-[#ff9aaa]',
  WARN: 'bg-warning/25 text-warning',
  INFO: 'bg-info/20 text-info',
  NOMI: 'bg-nominal/20 text-nominal',
}

const filter = ref<'all' | LogTopic>('all')
const FILTERS = [
  { value: 'all', label: 'Tout' },
  { value: 'alerts', label: 'Alertes' },
  { value: 'ai', label: 'IA' },
  { value: 'sync', label: 'Synchro' },
] as const
const lines = computed(() =>
  (filter.value === 'all' ? LOG : LOG.filter((entry) => entry.topic === filter.value)).map((entry) => ({
    ...entry,
    badgeClass: LEVEL_BADGE[entry.level],
  })),
)

const ROUTES = [
  { method: 'POST', path: '/sim/scenario', use: 'Injecter S1-S6' },
  { method: 'POST', path: '/sim/speed', use: 'Accélération ×1 à ×1000' },
  { method: 'GET', path: '/crew', use: 'Équipage et statuts' },
  { method: 'GET', path: '/alerts', use: 'File d’alertes' },
  { method: 'POST', path: '/emergency', use: 'Mode urgence' },
  { method: 'WS', path: '/ws/telemetry', use: 'Flux temps réel' },
]
const METHOD_CLASSES: Record<string, string> = {
  POST: 'bg-accent-soft text-accent',
  GET: 'bg-primary-soft text-primary',
  WS: 'bg-info-soft text-info-ink',
}
const apiRoutes = ROUTES.map((route) => ({ ...route, methodClass: METHOD_CLASSES[route.method] }))
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Journal moteur" subtitle="Ce que fait le moteur IA en temps réel pendant la démo">
      <template #actions>
        <UiButton :icon="Code" to="http://localhost:8000/docs">Ouvrir Swagger /docs</UiButton>
        <UiButton variant="secondary" :icon="Download">Exporter les logs</UiButton>
      </template>
    </UiPageHeader>

    <section aria-label="Performances" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard label="Latence API p95" :icon="Zap" value="96" unit="ms" sub="Cible < 150 ms" />
      <DashboardKpiCard label="Inférence IA" :icon="Brain" value="41" unit="ms" sub="Cible < 200 ms" />
      <DashboardKpiCard label="Clients WebSocket" :icon="RadioTower" value="4" sub="Tous connectés" />
      <DashboardKpiCard label="Mémoire" :icon="Cpu" value="312" unit="Mo" sub="Cible < 500 Mo" />
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
      <section class="rounded-2xl bg-ink p-5 text-white shadow-card" aria-label="Journal en direct">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="flex items-center gap-2 text-sm font-semibold">
            <span class="size-2.5 rounded-full bg-nominal" aria-hidden="true" /> En direct · seed 42 · ×240
          </p>
          <div class="flex gap-1 rounded-lg bg-white/5 p-1" role="radiogroup" aria-label="Filtrer le journal">
            <button
              v-for="option in FILTERS"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="filter === option.value"
              class="h-7 rounded-md px-3 text-xs"
              :class="filter === option.value ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'"
              @click="filter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <ol class="mt-4 space-y-2 font-mono text-[13px]" aria-live="polite">
          <li v-for="line in lines" :key="line.time" class="flex items-center gap-4">
            <span class="text-white/50">{{ line.time }}</span>
            <span
              class="w-12 rounded px-1.5 py-0.5 text-center text-[11px] font-semibold"
              :class="line.badgeClass"
            >
              {{ line.level }}
            </span>
            <span class="w-32 shrink-0 text-brand-cyan">{{ line.event }}</span>
            <span class="truncate text-white/85">{{ line.detail }}</span>
          </li>
        </ol>
      </section>

      <UiCard title="Routes utiles pour la démo" subtitle="Préfixe /api/v1" :icon="Code" :padded="false">
        <ul class="divide-y divide-divider px-5">
          <li v-for="apiRoute in apiRoutes" :key="apiRoute.path" class="flex items-center gap-3 py-3.5">
            <span
              class="w-12 rounded-md py-1 text-center text-[11px] font-bold"
              :class="apiRoute.methodClass"
            >
              {{ apiRoute.method }}
            </span>
            <code class="flex-1 text-sm font-semibold">{{ apiRoute.path }}</code>
            <span class="text-xs text-ink-muted">{{ apiRoute.use }}</span>
          </li>
        </ul>
      </UiCard>
    </div>
  </div>
</template>
