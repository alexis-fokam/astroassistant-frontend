<script setup lang="ts">
// Accessible on/off switch (role="switch"), sized for touch.
defineProps<{ label: string }>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    class="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors"
    :class="model ? 'justify-end bg-primary' : 'bg-line'"
    @click="model = !model"
  >
    <span class="size-5 rounded-full bg-white shadow" />
  </button>
</template>
