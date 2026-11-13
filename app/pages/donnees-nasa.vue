<script setup lang="ts">
import { Database, ExternalLink, Microscope, Satellite, ShieldAlert, WifiOff } from 'lucide-vue-next'

// Public page P-04: NASA open data used by the product (spec §12).
useHead({ title: 'Données NASA' })

const SOURCES = [
  {
    icon: Microscope,
    name: 'NASA Open Science Data Repository',
    acronym: 'OSDR · GeneLab · ALSDA',
    use: 'Calibrer les ordres de grandeur des effets simulés : perte osseuse, réponses cardiovasculaires et immunitaires au vol spatial.',
    where: 'Simulateur de télémétrie',
    url: 'https://osdr.nasa.gov',
  },
  {
    icon: Satellite,
    name: 'Space Weather Database (DONKI)',
    acronym: 'via api.nasa.gov',
    use: 'Rejouer des éruptions solaires et des événements à particules historiques, comme celui du 10 septembre 2017.',
    where: 'Dosimétrie, scénario S3',
    url: 'https://api.nasa.gov',
  },
  {
    icon: ShieldAlert,
    name: 'NASA-STD-3001',
    acronym: 'Space Flight Human-System Standard',
    use: 'Référence pour les limites d’exposition aux radiations et les exigences de santé de l’équipage.',
    where: 'Limite de carrière, seuils',
    url: 'https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/',
  },
  {
    icon: Database,
    name: 'Human Research Program',
    acronym: 'Human System Risk Board',
    use: 'Structurer les cinq domaines de risque suivis par le moteur de scoring.',
    where: 'Moteur IA',
    url: 'https://www.nasa.gov/hrp/',
  },
]
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-16">
    <p class="text-sm font-semibold text-primary">Données ouvertes</p>
    <h1 class="mt-2 text-4xl font-bold">Les données NASA derrière Astro Assistant</h1>
    <p class="mt-4 max-w-2xl text-lg text-ink-muted">
      Les ressources ouvertes de la NASA donnent au prototype des ordres de grandeur réalistes. Elles sont
      téléchargées avant la mission et embarquées, ce qui préserve le fonctionnement hors ligne.
    </p>

    <div class="mt-12 grid gap-5 md:grid-cols-2">
      <article
        v-for="source in SOURCES"
        :key="source.name"
        class="flex flex-col rounded-xl border border-divider bg-surface p-6 shadow-card"
      >
        <div class="flex items-start gap-4">
          <span
            class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"
          >
            <component :is="source.icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
          </span>
          <div>
            <h2 class="text-lg font-semibold">{{ source.name }}</h2>
            <p class="text-sm text-ink-muted">{{ source.acronym }}</p>
          </div>
        </div>
        <p class="mt-4 flex-1 text-sm">{{ source.use }}</p>
        <div class="mt-5 flex items-center justify-between gap-3 border-t border-divider pt-4">
          <span class="rounded-full bg-subtle px-3 py-1 text-xs font-medium text-ink-muted">{{
            source.where
          }}</span>
          <a
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Source <ExternalLink :size="14" aria-hidden="true" />
            <span class="sr-only">(nouvel onglet)</span>
          </a>
        </div>
      </article>
    </div>

    <div class="mt-10 flex items-start gap-4 rounded-2xl bg-info-soft p-6">
      <WifiOff :size="24" :stroke-width="1.75" class="mt-0.5 shrink-0 text-info-ink" aria-hidden="true" />
      <p class="text-sm">
        <b>Offline-first.</b> Aucune requête réseau n’est faite pendant la mission : les catalogues sont
        copiés localement avant le départ et mis à jour à chaque fenêtre de contact.
      </p>
    </div>
  </div>
</template>
