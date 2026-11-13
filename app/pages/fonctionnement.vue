<script setup lang="ts">
import { ArrowDown, ArrowUp, Cpu, Gauge, Languages, RadioTower, Shield, WifiOff, Zap } from 'lucide-vue-next'

// Public page P-03: architecture, AI pipeline, risk score and non-functional targets (spec §6-§8).
useHead({ title: 'Comment ça marche' })

const LAYERS = [
  {
    title: 'Interface équipage',
    tech: 'Nuxt · PWA hors ligne',
    border: 'border-primary',
    modules: ['Dashboard', 'Check-in', 'Protocoles', 'PVT', 'Urgence', 'Vue CMO'],
    tools: ['Pinia', 'ECharts', 'Tailwind', 'IndexedDB', 'i18n FR/EN'],
    link: 'REST (HTTP local) · WebSocket temps réel',
  },
  {
    title: 'Moteur IA',
    tech: 'FastAPI · Python',
    border: 'border-brand-violet',
    modules: [
      'Routes REST + WebSocket',
      'Pipeline Pandas/NumPy',
      'Isolation Forest',
      'Règles cliniques YAML',
      'Simulateur',
      'Synchronisation',
    ],
    tools: ['Pydantic', 'Scikit-learn', 'joblib', 'APScheduler'],
    link: 'SQLAlchemy',
  },
  {
    title: 'Stockage local',
    tech: 'SQLite (WAL) · SQLAlchemy',
    border: 'border-primary',
    modules: ['Mesures', 'Scores', 'Alertes', 'Journal d’audit'],
    tools: ['Fichiers modèles', 'Protocoles YAML'],
    link: null,
  },
]

const PIPELINE = [
  { title: 'Ingestion', text: 'Validation Pydantic, horodatage', tool: 'FastAPI' },
  { title: 'Nettoyage', text: 'Rejet des valeurs impossibles, lissage', tool: 'Pandas' },
  { title: 'Features', text: 'Baselines, pentes, dette de sommeil', tool: 'NumPy' },
  { title: 'Détection', text: 'Z-score robuste, Isolation Forest', tool: 'Scikit-learn' },
  { title: 'Scoring', text: 'Score par domaine, max-severity', tool: 'Python' },
  { title: 'Décision', text: 'Règles → alerte → protocole', tool: 'YAML' },
  { title: 'Diffusion', text: 'Push dashboard, journal, file sol', tool: 'WebSocket' },
]

const TARGETS = [
  { icon: WifiOff, value: '100 %', label: 'fonctions M et S hors ligne' },
  { icon: Zap, value: '< 200 ms', label: 'inférence IA' },
  { icon: Gauge, value: '< 2 s', label: 'premier affichage' },
  { icon: Cpu, value: '< 500 Mo', label: 'RAM au total' },
  { icon: Shield, value: 'WCAG 2.1 AA', label: 'accessibilité' },
  { icon: Languages, value: 'FR · EN', label: 'interface bilingue' },
]
</script>

<template>
  <div>
    <SitePageHero
      crumb="Comment ça marche"
      eyebrow="Architecture"
      title="Tout tourne à bord, sans dépendre de la Terre"
      intro="Une application web installable (PWA) parle à un moteur IA local. Les données restent sur l’appareil ; un résumé part vers le sol à chaque fenêtre de contact."
    />

    <!-- Architecture -->
    <section
      class="mx-auto grid max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[1.9fr_1fr]"
      aria-label="Architecture"
    >
      <div>
        <template v-for="layer in LAYERS" :key="layer.title">
          <article class="flex flex-wrap gap-6 rounded-2xl border-2 bg-surface p-5" :class="layer.border">
            <div class="w-40">
              <h2 class="font-semibold">{{ layer.title }}</h2>
              <p class="text-xs text-ink-muted">{{ layer.tech }}</p>
            </div>
            <div class="flex-1 space-y-2.5">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="module in layer.modules"
                  :key="module"
                  class="rounded-md bg-subtle px-2.5 py-1 text-xs"
                  >{{ module }}</span
                >
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tool in layer.tools"
                  :key="tool"
                  class="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-accent"
                  >{{ tool }}</span
                >
              </div>
            </div>
          </article>
          <p v-if="layer.link" class="flex items-center justify-center gap-2 py-2.5 text-xs text-ink-muted">
            <ArrowDown :size="13" aria-hidden="true" /> {{ layer.link }}
            <ArrowUp v-if="layer.link.includes('REST')" :size="13" aria-hidden="true" />
          </p>
        </template>
      </div>
      <aside class="h-fit rounded-2xl bg-primary-soft p-5">
        <h2 class="flex items-center gap-2 font-semibold">
          <RadioTower :size="18" class="text-primary" aria-hidden="true" /> Liaison sol différée
        </h2>
        <p class="mt-2 text-sm text-ink-muted">
          Paquets JSON compressés, signés SHA-256, envoyés quand le lien revient. Les consignes du sol
          reviennent par le même chemin.
        </p>
        <dl class="mt-4 space-y-2 border-t border-primary/15 pt-4 text-sm">
          <div class="flex justify-between">
            <dt class="text-ink-muted">Latence Terre-Mars</dt>
            <dd>4 à 22 min</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Priorité</dt>
            <dd>CRITICAL en tête</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-ink-muted">Intégrité</dt>
            <dd>SHA-256</dd>
          </div>
        </dl>
      </aside>
    </section>

    <!-- AI pipeline -->
    <section class="bg-canvas py-16" aria-labelledby="pipeline-title">
      <div class="mx-auto max-w-6xl px-6">
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Chaîne de traitement IA</p>
        <h2 id="pipeline-title" class="mt-2 text-3xl font-semibold">De la mesure à l’action en 7 étapes</h2>
        <ol class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <li
            v-for="(step, index) in PIPELINE"
            :key="step.title"
            class="rounded-2xl border border-divider bg-surface p-4 shadow-card"
          >
            <span
              class="flex size-7 items-center justify-center rounded-full bg-ai-gradient text-xs font-bold text-white"
              >{{ index + 1 }}</span
            >
            <h3 class="mt-3 text-sm font-semibold">{{ step.title }}</h3>
            <p class="mt-1 text-xs text-ink-muted">{{ step.text }}</p>
            <span class="mt-3 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-accent">{{
              step.tool
            }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- Risk score and targets -->
    <section class="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
      <div>
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Score de risque</p>
        <h2 class="mt-2 text-3xl font-semibold">Un score lisible de 0 à 100</h2>
        <p class="mt-3 text-ink-muted">
          Chaque domaine combine écart à la baseline, anomalie multivariée, règles cliniques et tendance. Le
          domaine le plus grave impose le statut global.
        </p>
        <code class="mt-5 block overflow-x-auto rounded-xl bg-ink px-4 py-3.5 text-sm text-white">
          score_domaine = 100 × clip(w1·z + w2·isolation + w3·règles + w4·pente, 0, 1)
        </code>
        <div class="mt-4 grid grid-cols-3 overflow-hidden rounded-xl text-center text-sm font-semibold">
          <span class="bg-nominal py-3 text-ink">0-39 · NOMINAL</span>
          <span class="bg-warning py-3 text-ink">40-69 · WARNING</span>
          <span class="bg-critical py-3 text-white">70-100 · CRITICAL</span>
        </div>
        <p class="mt-3 text-xs text-ink-muted">
          Un WARNING n’est confirmé qu’après deux mesures consécutives, pour limiter les fausses alertes.
        </p>
      </div>
      <div>
        <p class="text-[11px] font-semibold tracking-wider text-accent uppercase">Exigences</p>
        <h2 class="mt-2 text-3xl font-semibold">Conçu pour l’espace</h2>
        <dl class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div
            v-for="target in TARGETS"
            :key="target.label"
            class="flex flex-col-reverse rounded-2xl border border-divider p-4"
          >
            <dt class="mt-1 text-xs text-ink-muted">{{ target.label }}</dt>
            <dd class="text-xl font-semibold text-primary">{{ target.value }}</dd>
            <dd class="mb-3">
              <component :is="target.icon" :size="18" class="text-accent" aria-hidden="true" />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>
