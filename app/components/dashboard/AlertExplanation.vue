<script setup lang="ts">
import { Code, Cpu } from 'lucide-vue-next'
import type { AlertExplanation } from '~/types/domain'

/**
 * Explainability panel (spec F2.7): top contributing factors, the rule that fired
 * and the model output behind an alert.
 */
defineProps<AlertExplanation>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-xs font-medium text-ink-muted">Facteurs principaux</p>
    <div v-for="factor in factors" :key="factor.label">
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <span class="font-semibold">{{ factor.label }}</span>
        <span class="tabular text-xs text-ink-muted">{{ factor.value }}</span>
      </div>
      <UiProgress
        class="mt-1.5"
        :value="factor.contribution * 100"
        :height="6"
        bar-class="bg-warning"
        :label="`Contribution ${factor.label}`"
      />
      <p class="mt-1 text-xs text-ink-muted">Contribution {{ Math.round(factor.contribution * 100) }} %</p>
    </div>

    <div class="flex items-start gap-2.5 rounded-lg bg-accent-soft p-3">
      <Code :size="16" class="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <div class="min-w-0">
        <p class="text-xs font-semibold">Règle déclenchée</p>
        <p class="mt-0.5 font-mono text-xs break-words text-ink-muted">{{ rule }}</p>
      </div>
    </div>

    <dl class="space-y-1.5 text-sm">
      <div class="flex justify-between gap-3">
        <dt class="flex items-center gap-1.5 text-ink-muted"><Cpu :size="14" aria-hidden="true" /> Isolation Forest</dt>
        <dd class="tabular font-medium">{{ anomalyScore.toFixed(2).replace('.', ',') }} · anomalie</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-ink-muted">Confirmé sur</dt>
        <dd class="font-medium">{{ confirmations }} mesures consécutives</dd>
      </div>
    </dl>
  </div>
</template>
