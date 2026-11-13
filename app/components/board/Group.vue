<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

/**
 * monday-style board group (Figma E-07, M-01/M-02): coloured title with a chevron,
 * a table framed by a coloured left edge, and an optional summary slot under it.
 * Pass the table head and body through the default slot.
 */
const props = withDefaults(
  defineProps<{
    title: string
    count?: string
    /** Accent colour of the title and left edge (any CSS colour). */
    color?: string
    collapsible?: boolean
  }>(),
  { color: '#2b6fe6', collapsible: true },
)

const open = ref(true)
const id = useId()
</script>

<template>
  <section class="space-y-2">
    <h3 class="flex items-center gap-2">
      <button
        v-if="props.collapsible"
        type="button"
        class="flex items-center gap-2 rounded-md text-lg font-semibold"
        :style="{ color }"
        :aria-expanded="open"
        :aria-controls="id"
        @click="open = !open"
      >
        <ChevronDown
          :size="18"
          class="transition-transform"
          :class="!open && '-rotate-90'"
          aria-hidden="true"
        />
        {{ title }}
      </button>
      <span v-else class="text-lg font-semibold" :style="{ color }">{{ title }}</span>
      <span v-if="count" class="text-xs font-normal text-ink-muted">{{ count }}</span>
    </h3>
    <div v-show="open" :id="id">
      <div
        class="overflow-x-auto rounded-lg border border-divider bg-surface"
        :style="{ boxShadow: `inset 4px 0 0 ${color}` }"
      >
        <table class="w-full border-collapse text-sm">
          <slot />
        </table>
      </div>
      <slot name="summary" />
    </div>
  </section>
</template>
