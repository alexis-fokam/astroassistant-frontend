<script setup lang="ts">
import { BadgeAlert, FlaskConical, Pill, Scale, Stethoscope } from 'lucide-vue-next'

// Public page P-08: limits and medical disclaimer (spec p.2 and §14).
useHead({ title: 'Avertissement et limites' })

const LIMITS = [
  {
    icon: BadgeAlert,
    title: 'Pas un dispositif médical',
    text: 'Astro Assistant est un prototype de hackathon. Il n’a reçu aucune certification et ne pose aucun diagnostic définitif.',
  },
  {
    icon: Scale,
    title: 'Seuils à valider',
    text: 'Les seuils, scores et pondérations servent à démontrer un concept. Ils doivent être validés par des professionnels de médecine spatiale.',
  },
  {
    icon: Pill,
    title: 'Aucune prescription',
    text: 'Les protocoles orientent l’astronaute. Ils ne prescrivent jamais de médicament : cette décision revient au médecin de bord.',
  },
  {
    icon: FlaskConical,
    title: 'Données simulées',
    text: 'Faute de données réelles d’astronautes, la télémétrie est simulée et calibrée sur la littérature et les données NASA OSDR.',
  },
]
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-16">
    <p class="text-sm font-semibold text-primary">Transparence</p>
    <h1 class="mt-2 text-4xl font-bold">Avertissement et limites</h1>
    <p class="mt-4 text-lg text-ink-muted">
      Un outil d’aide à la décision doit dire clairement ce qu’il ne fait pas. Voici les limites de ce
      prototype.
    </p>

    <div class="mt-10 space-y-4">
      <article
        v-for="limit in LIMITS"
        :key="limit.title"
        class="flex gap-5 rounded-xl border border-divider bg-surface p-6 shadow-card"
      >
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning-ink"
        >
          <component :is="limit.icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
        </span>
        <div>
          <h2 class="font-semibold">{{ limit.title }}</h2>
          <p class="mt-1 text-sm text-ink-muted">{{ limit.text }}</p>
        </div>
      </article>
    </div>

    <div class="mt-10 flex items-start gap-4 rounded-2xl bg-primary-soft p-6">
      <Stethoscope :size="24" :stroke-width="1.75" class="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <p class="text-sm">
        Le système privilégie la sensibilité (ne pas manquer une vraie anomalie) et limite les fausses alertes
        grâce à une baseline individuelle et à une confirmation sur deux mesures consécutives.
      </p>
    </div>
  </div>
</template>
