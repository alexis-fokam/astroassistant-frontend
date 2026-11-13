<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { DOMAIN_KEYS, DOMAINS } from '~/constants/domains'
import { LEVEL_STYLES } from '~/constants/levels'
import type { Domain } from '~/types/domain'
import { levelFromScore } from '~/utils/health'

// Per-domain risk scores (spec F2.5); each row links to the system detail page.
defineProps<{ scores: Record<Domain, number> }>()
</script>

<template>
  <ul class="space-y-1">
    <li v-for="key in DOMAIN_KEYS" :key="key">
      <NuxtLink
        :to="`/equipage/systemes/${key}`"
        class="group flex flex-col gap-1.5 rounded-lg px-2 py-2 hover:bg-subtle"
      >
        <span class="flex items-center gap-2 text-sm">
          <component
            :is="DOMAINS[key].icon"
            :size="16"
            :stroke-width="1.75"
            class="text-ink-muted"
            aria-hidden="true"
          />
          <span class="flex-1 font-medium">{{ DOMAINS[key].short }}</span>
          <span class="font-semibold tabular">{{ scores[key] }}</span>
          <component
            :is="LEVEL_STYLES[levelFromScore(scores[key])].icon"
            :size="15"
            :stroke-width="2.4"
            :class="LEVEL_STYLES[levelFromScore(scores[key])].ink"
            :aria-label="LEVEL_STYLES[levelFromScore(scores[key])].label"
          />
          <ChevronRight :size="15" class="text-ink-faint group-hover:text-ink" aria-hidden="true" />
        </span>
        <UiProgress
          :value="scores[key]"
          :height="6"
          :bar-class="LEVEL_STYLES[levelFromScore(scores[key])].bar"
          :label="`Score ${DOMAINS[key].short}`"
        />
      </NuxtLink>
    </li>
  </ul>
</template>
