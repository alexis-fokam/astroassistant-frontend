<script setup lang="ts">
/** Sélecteur de langue FR / EN, présent dans les en-têtes du site et de l'application. */
const { locale, setLocale, t } = useI18n()
</script>

<template>
  <div
    role="group"
    :aria-label="t('Langue')"
    class="flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs font-semibold"
  >
    <button
      v-for="option in LOCALES"
      :key="option.code"
      type="button"
      class="h-7 rounded-md px-2 transition-colors"
      :class="locale === option.code ? 'bg-primary text-white' : 'text-ink-muted hover:text-ink'"
      :aria-pressed="locale === option.code"
      @click="setLocale(option.code)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
