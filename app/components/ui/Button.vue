<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
    size?: 'sm' | 'md' | 'lg'
    to?: string
    icon?: Component
    iconRight?: Component
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  secondary: 'bg-surface text-ink border border-line hover:bg-subtle',
  ghost: 'text-ink-muted hover:bg-subtle hover:text-ink',
  danger: 'bg-critical text-white hover:brightness-95 shadow-sm',
  accent: 'bg-accent text-white hover:brightness-110 shadow-sm',
}
const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'min-h-touch px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors',
  variants[props.variant],
  sizes[props.size],
  props.block && 'w-full',
  props.disabled && 'pointer-events-none opacity-45',
])
const iconSize = computed(() => (props.size === 'sm' ? 15 : 18))
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <component :is="icon" v-if="icon" :size="iconSize" :stroke-width="2" aria-hidden="true" />
    <slot />
    <component :is="iconRight" v-if="iconRight" :size="iconSize" :stroke-width="2" aria-hidden="true" />
  </NuxtLink>
  <button v-else :type="type" :class="classes" :disabled="disabled">
    <component :is="icon" v-if="icon" :size="iconSize" :stroke-width="2" aria-hidden="true" />
    <slot />
    <component :is="iconRight" v-if="iconRight" :size="iconSize" :stroke-width="2" aria-hidden="true" />
  </button>
</template>
