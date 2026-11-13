<script setup lang="ts">
import { ListChecks, Play } from 'lucide-vue-next'

// Public page P-05: the six reference scenarios replayed for the jury (spec §4.1).
useHead({ title: 'Scénarios de démonstration' })

const { scenarios, findProtocol } = useMissionData()
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-16">
    <p class="text-sm font-semibold text-primary">Démo jury</p>
    <h1 class="mt-2 text-4xl font-bold">Six situations, une réaction claire</h1>
    <p class="mt-4 max-w-2xl text-lg text-ink-muted">
      Chaque scénario injecte des données réalistes dans le simulateur. Le système doit identifier le bon
      domaine, afficher le bon niveau et proposer le bon protocole.
    </p>

    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="scenario in scenarios"
        :key="scenario.code"
        class="flex flex-col rounded-xl border border-divider bg-surface p-6 shadow-card"
      >
        <div class="flex items-center justify-between">
          <span class="rounded-md bg-subtle px-2.5 py-1 font-display text-sm font-semibold">{{
            scenario.code
          }}</span>
          <UiStatusBadge :level="scenario.expected" />
        </div>
        <h2 class="mt-4 text-lg font-semibold">{{ scenario.name }}</h2>
        <p class="mt-1 flex-1 text-sm text-ink-muted">{{ scenario.description }}</p>
        <p
          v-if="scenario.protocol"
          class="mt-4 flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary"
        >
          <ListChecks :size="16" aria-hidden="true" />
          <span>
            <b>{{ scenario.protocol }}</b> · {{ findProtocol(scenario.protocol)?.title }}
          </span>
        </p>
      </article>
    </div>

    <div class="mt-10 flex flex-wrap items-center gap-4">
      <UiButton size="lg" to="/simulation" :icon="Play">Ouvrir le panneau de simulation</UiButton>
      <p class="text-sm text-ink-muted">Graine fixe (42) : chaque démo se rejoue à l’identique.</p>
    </div>
  </div>
</template>
