<script setup lang="ts">
defineProps<{ options: { value: string; label: string }[]; size?: 'sm' | 'md' | 'lg'; label?: string }>()
const model = defineModel<string>()
</script>

<template>
  <div role="radiogroup" :aria-label="label" class="inline-flex gap-0.5 rounded-lg bg-subtle p-1">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      role="radio"
      :aria-checked="model === o.value"
      class="flex-1 rounded-md font-medium whitespace-nowrap transition-colors"
      :class="[
        size === 'lg' ? 'h-12 px-4 text-sm' : size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-9 px-3.5 text-[13px]',
        model === o.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
      ]"
      @click="model = o.value"
    >
      {{ o.label }}
    </button>
  </div>
</template>
