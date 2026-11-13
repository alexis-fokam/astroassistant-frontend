<script setup lang="ts">
/**
 * Accessible range input with the brand-gradient track from the Figma design system.
 * Native <input type="range"> keeps keyboard and screen-reader support.
 */
const props = withDefaults(
  defineProps<{ min?: number; max?: number; step?: number; label: string; valueText?: string }>(),
  { min: 0, max: 10, step: 1 },
)
const model = defineModel<number>({ required: true })
const percent = computed(() => ((model.value - props.min) / (props.max - props.min)) * 100)
</script>

<template>
  <input
    v-model.number="model"
    type="range"
    class="ui-slider w-full"
    :min="min"
    :max="max"
    :step="step"
    :aria-label="label"
    :aria-valuetext="valueText"
    :style="{ '--fill': `${percent}%` }"
  />
</template>

<style scoped>
.ui-slider {
  appearance: none;
  height: 28px;
  background: transparent;
  cursor: pointer;
}
.ui-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, #20d9e0, #2f86eb 50%, #9b5cf2) 0 / var(--fill) 100% no-repeat,
    #eceef4;
}
.ui-slider::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, #20d9e0, #2f86eb 50%, #9b5cf2) 0 / var(--fill) 100% no-repeat,
    #eceef4;
}
.ui-slider::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  margin-top: -8px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #2b6fe6;
  box-shadow: 0 2px 6px rgb(46 55 66 / 0.25);
}
.ui-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #2b6fe6;
  box-shadow: 0 2px 6px rgb(46 55 66 / 0.25);
}
</style>
