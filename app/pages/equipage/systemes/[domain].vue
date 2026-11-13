<script setup lang="ts">
import { Cpu, Download, SlidersHorizontal } from 'lucide-vue-next'
import { DOMAIN_KEYS, DOMAINS } from '~/constants/domains'
import { LEVEL_HEX, LEVEL_STYLES } from '~/constants/levels'
import { SYSTEMS } from '~/mocks/systems'
import type { Domain } from '~/types/domain'
import { levelFromScore } from '~/utils/health'

/** Page E-02: physiological system detail, one tab per risk domain (spec F1.3 to F1.6, F2.7). */
definePageMeta({
  layout: 'app',
  validate: (route) => DOMAIN_KEYS.includes(route.params.domain as Domain),
})

const route = useRoute()
const { currentCrew, currentExplanation } = useMissionData()

const domain = computed(() => route.params.domain as Domain)
const detail = computed(() => SYSTEMS[domain.value])
const score = computed(() => currentCrew.domains[domain.value])
const level = computed(() => levelFromScore(score.value))

useHead({ title: () => `Système ${DOMAINS[domain.value].label.toLowerCase()}` })

const range = ref('7d')
const RANGES = [
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 j' },
  { value: 'mission', label: 'Mission' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Domaines" class="flex flex-wrap gap-1 rounded-xl bg-surface p-1 shadow-card">
        <NuxtLink
          v-for="key in DOMAIN_KEYS"
          :key="key"
          :to="`/equipage/systemes/${key}`"
          class="flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors"
          :class="
            key === domain ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-subtle hover:text-ink'
          "
          :aria-current="key === domain ? 'page' : undefined"
        >
          <component :is="DOMAINS[key].icon" :size="17" :stroke-width="1.75" aria-hidden="true" />
          {{ DOMAINS[key].label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <UiSegmented v-model="range" :options="RANGES" label="Période" />
        <UiButton variant="secondary" :icon="Download">Export CSV</UiButton>
      </div>
    </div>

    <section
      class="flex flex-wrap items-center gap-4 rounded-xl border p-4"
      :class="[LEVEL_STYLES[level].soft, 'border-current/20']"
    >
      <UiStatusBadge
        :level="level"
        size="lg"
        variant="solid"
        :label="`${LEVEL_STYLES[level].label} · ${score} / 100`"
      />
      <h1 class="text-lg font-semibold text-ink">{{ DOMAINS[domain].label }}</h1>
      <p class="text-sm text-ink-muted">{{ detail.summary }}</p>
    </section>

    <div class="grid gap-6" :class="level === 'nominal' ? '' : 'lg:grid-cols-[2fr_1fr]'">
      <div class="grid gap-6 md:grid-cols-2">
        <UiCard v-for="chart in detail.charts" :key="chart.id" :title="chart.label">
          <template #actions>
            <UiStatusBadge :level="chart.level" />
          </template>
          <div class="mb-3 flex items-baseline justify-between gap-3">
            <p
              class="font-display text-2xl font-semibold"
              :class="chart.level !== 'nominal' && LEVEL_STYLES[chart.level].ink"
              data-vital
            >
              {{ chart.value }} <span class="font-sans text-sm text-ink-muted">{{ chart.unit }}</span>
            </p>
            <p class="text-right text-xs text-ink-muted">{{ chart.trend }}</p>
          </div>
          <ChartsLineChart
            :values="chart.values"
            :band="chart.band"
            :min="chart.min"
            :max="chart.max"
            :color="LEVEL_HEX[chart.level]"
            :height="170"
            :label="`${chart.label} sur la période`"
          />
        </UiCard>
      </div>

      <UiCard v-if="level !== 'nominal'" title="Pourquoi ce niveau ?" :icon="Cpu">
        <DashboardAlertExplanation v-bind="currentExplanation" />
      </UiCard>
    </div>

    <UiCard
      v-if="detail.thresholds"
      title="Seuils cliniques configurables"
      subtitle="Exemples à valider médicalement (§6.2)"
      :icon="SlidersHorizontal"
      :padded="false"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-y border-divider bg-subtle text-left text-xs text-ink-muted">
              <th scope="col" class="px-5 py-2.5 font-semibold">Paramètre</th>
              <th scope="col" class="px-5 py-2.5 font-semibold">NOMINAL</th>
              <th scope="col" class="px-5 py-2.5 font-semibold">WARNING</th>
              <th scope="col" class="px-5 py-2.5 font-semibold">CRITICAL</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in detail.thresholds"
              :key="row.parameter"
              class="border-b border-divider last:border-0"
            >
              <th scope="row" class="px-5 py-3 text-left font-semibold">{{ row.parameter }}</th>
              <td class="px-5 py-3 text-nominal-ink">{{ row.nominal }}</td>
              <td class="px-5 py-3 text-warning-ink">{{ row.warning }}</td>
              <td class="px-5 py-3 text-critical-ink">{{ row.critical }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>
