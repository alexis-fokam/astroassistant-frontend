<script setup lang="ts">
import type { Component } from 'vue'

// Carte de contenu : titre, icône, sous-titre, actions à droite ; `padded=false` pour un tableau.

defineProps<{ title?: string; icon?: Component; subtitle?: string; padded?: boolean }>()
</script>

<template>
  <section
    class="flex min-w-0 flex-col rounded-2xl border border-divider bg-surface shadow-card transition-shadow hover:shadow-hover"
  >
    <header v-if="title" class="flex items-center justify-between gap-3 px-6 pt-5 pb-4">
      <div class="flex min-w-0 items-center gap-2.5">
        <component
          :is="icon"
          v-if="icon"
          :size="18"
          :stroke-width="1.75"
          class="shrink-0 text-ink-muted"
          aria-hidden="true"
        />
        <div class="min-w-0">
          <h3 class="truncate text-[15px] font-semibold">{{ title }}</h3>
          <p v-if="subtitle" class="truncate text-xs text-ink-muted">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div :class="padded === false ? '' : 'px-6 pb-6'" class="flex min-h-0 flex-1 flex-col">
      <slot />
    </div>
  </section>
</template>
