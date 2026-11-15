<script setup lang="ts">
/**
 * Petite carte flottante au-dessus d'un graphique : valeur du point survolé et son repère
 * (date, heure, série). Elle reste dans le cadre du graphique sur les bords.
 */
const props = defineProps<{
  /** Position horizontale en pourcentage de la largeur (« 42% »). */
  left: string
  value?: string
  label: string
  note?: string
  /** Plusieurs séries : une ligne par série avec sa couleur. */
  rows?: { name: string; value: string; color: string }[]
}>()

// Sur les bords, on décale la carte pour qu'elle ne sorte pas du graphique.
const shift = computed(() => {
  const pct = Number.parseFloat(props.left)
  if (pct < 15) return '0%'
  if (pct > 85) return '-100%'
  return '-50%'
})
</script>

<template>
  <div
    class="pointer-events-none absolute -top-2 z-10 min-w-28 -translate-y-full rounded-lg border border-divider bg-surface px-3 py-2 text-xs shadow-raised"
    :style="{ left, transform: `translate(${shift}, -100%)` }"
    role="status"
    aria-live="polite"
  >
    <p class="font-medium whitespace-nowrap text-ink-muted">{{ label }}</p>
    <p v-if="value" class="mt-0.5 font-display text-sm font-semibold whitespace-nowrap text-ink tabular">
      {{ value }}
    </p>
    <ul v-if="rows?.length" class="mt-1 space-y-0.5">
      <li v-for="row in rows" :key="row.name" class="flex items-center gap-2 whitespace-nowrap">
        <span class="size-2 rounded-full" :style="{ background: row.color }" aria-hidden="true" />
        <span class="text-ink-muted">{{ row.name }}</span>
        <span class="ml-auto font-semibold text-ink tabular">{{ row.value }}</span>
      </li>
    </ul>
    <p v-if="note" class="mt-0.5 text-[11px] text-accent">{{ note }}</p>
  </div>
</template>
