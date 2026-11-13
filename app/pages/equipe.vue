<script setup lang="ts">
import { Flag, Plus } from 'lucide-vue-next'

// Public page P-06: team roles (spec §1.1) and the 48-hour hackathon roadmap (spec §15).
useHead({ title: 'Équipe' })

const MEMBERS = [
  {
    initials: 'AF',
    name: 'Alexis Fokam',
    role: 'Lead Developer & IA Device Engineer · chef de projet',
    text: 'Architecture, backend FastAPI, modèles ML, moteur de règles, coordination et soumission.',
    open: false,
  },
  {
    initials: '?',
    name: 'À désigner',
    role: 'Développeur frontend Nuxt',
    text: 'Dashboard, composants graphiques, PWA hors ligne, état local Pinia, intégration API et WebSocket.',
    open: true,
  },
  {
    initials: '?',
    name: 'À désigner',
    role: 'Designer UI/UX & Data Analyst',
    text: 'Design system cockpit, maquettes, accessibilité, jeux de données, storytelling du pitch.',
    open: true,
  },
]

const PHASES = [
  {
    window: 'H0 → H8',
    title: 'Fondations',
    text: 'Repo, Nuxt + FastAPI, Docker Compose, modèle de données, simulateur, design system, PWA.',
    deliverable: 'API qui génère des mesures, dashboard qui les affiche',
  },
  {
    window: 'H8 → H24',
    title: 'Cœur IA & dashboard',
    text: 'Pipeline, baselines, scoring, Isolation Forest, règles, WebSocket, cartes F1, dosimétrie F5.',
    deliverable: 'Statut NOMINAL / WARNING / CRITICAL en temps réel',
  },
  {
    window: 'H24 → H38',
    title: 'Décision & équipage',
    text: 'Check-in, protocoles, mode urgence, vue CMO, scénarios S1-S6, puis F6-F8 et F10.',
    deliverable: 'Démo complète, mode hors ligne fonctionnel',
  },
  {
    window: 'H38 → H48',
    title: 'Finition & soumission',
    text: 'Tests, corrections, polish UI, README, vidéo, slides, dépôt.',
    deliverable: 'Projet soumis sur Space Apps',
  },
]
</script>

<template>
  <div>
    <SitePageHero
      crumb="Équipe"
      eyebrow="L’équipe"
      title="Trois rôles, un week-end de 48 heures"
      intro="Une équipe resserrée, organisée par phases, avec des livrables clairs à chaque étape."
    />

    <section class="mx-auto grid max-w-6xl gap-5 px-6 pb-16 md:grid-cols-3" aria-label="Membres">
      <article
        v-for="member in MEMBERS"
        :key="member.role"
        class="flex flex-col items-center rounded-2xl border border-divider bg-surface p-6 text-center shadow-card"
      >
        <span
          class="flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white"
          :class="member.open ? 'bg-ink-faint' : 'bg-crew-2'"
          aria-hidden="true"
        >
          {{ member.initials }}
        </span>
        <h2 class="mt-4 text-lg font-semibold">{{ member.name }}</h2>
        <p class="text-xs font-medium text-accent">{{ member.role }}</p>
        <p class="mt-3 text-sm text-ink-muted">{{ member.text }}</p>
        <UiButton v-if="member.open" class="mt-4" variant="secondary" size="sm" :icon="Plus" to="/ressources">
          Rejoindre l’équipe
        </UiButton>
      </article>
    </section>

    <section class="bg-canvas py-16" aria-labelledby="roadmap-title">
      <div class="mx-auto max-w-6xl px-6">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Roadmap hackathon</p>
        <h2 id="roadmap-title" class="mt-2 text-3xl font-semibold">Quatre phases jusqu’à la soumission</h2>
        <ol class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(phase, index) in PHASES"
            :key="phase.title"
            class="flex flex-col rounded-2xl border border-divider bg-surface p-5 shadow-card"
          >
            <div class="flex items-center gap-2">
              <span
                class="flex size-7 items-center justify-center rounded-full bg-ai-gradient text-xs font-bold text-white"
              >
                {{ index + 1 }}
              </span>
              <span class="rounded-full bg-subtle px-2.5 py-0.5 text-xs">{{ phase.window }}</span>
            </div>
            <h3 class="mt-3 font-semibold">{{ phase.title }}</h3>
            <p class="mt-1 flex-1 text-sm text-ink-muted">{{ phase.text }}</p>
            <p class="mt-4 flex gap-2 rounded-lg bg-nominal-soft p-3 text-xs text-nominal-ink">
              <Flag :size="14" class="mt-px shrink-0" aria-hidden="true" /> {{ phase.deliverable }}
            </p>
          </li>
        </ol>
        <div class="mt-6 grid grid-cols-[8fr_16fr_14fr_10fr] gap-2" aria-hidden="true">
          <span v-for="phase in PHASES" :key="phase.window" class="h-1.5 rounded-full bg-ai-gradient" />
        </div>
      </div>
    </section>
  </div>
</template>
