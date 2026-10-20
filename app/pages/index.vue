<script setup lang="ts">
const theme = ref<'dark' | 'light'>('dark')

useHead({
  htmlAttrs: { 'data-theme': theme },
})

// Page de vérification du thème Tailwind — à remplacer par le dashboard F1.
const statuses = [
  { key: 'nominal', label: 'NOMINAL', icon: '✓', classes: 'border-nominal text-nominal' },
  { key: 'warning', label: 'WARNING', icon: '!', classes: 'border-warning text-warning' },
  { key: 'critical', label: 'CRITICAL', icon: '✕', classes: 'border-critical text-critical animate-alert-pulse' },
] as const
</script>

<template>
  <main class="mx-auto max-w-4xl space-y-6 p-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">AstroVitals</h1>
      <button
        type="button"
        class="min-h-touch rounded-lg border border-border bg-surface px-4 text-sm text-text-muted hover:bg-surface-raised"
        @click="theme = theme === 'dark' ? 'light' : 'dark'"
      >
        Mode {{ theme === 'dark' ? 'clair' : 'sombre' }}
      </button>
    </header>

    <section class="grid gap-4 sm:grid-cols-3">
      <div
        v-for="s in statuses"
        :key="s.key"
        class="flex min-h-touch items-center gap-3 rounded-xl border-2 bg-surface p-4"
        :class="s.classes"
        role="status"
      >
        <span aria-hidden="true" class="text-xl font-bold">{{ s.icon }}</span>
        <span class="font-semibold tracking-wide">{{ s.label }}</span>
      </div>
    </section>

    <section class="rounded-xl border border-border bg-surface p-6">
      <p class="text-sm text-text-muted">Fréquence cardiaque</p>
      <p class="text-4xl font-semibold" data-vital>72 <span class="text-base text-text-muted">bpm</span></p>
      <p class="mt-2 text-sm text-info">Thème cockpit Tailwind opérationnel.</p>
    </section>
  </main>
</template>
