<script setup lang="ts">
import {
  Check,
  ChevronRight,
  Code,
  Copy,
  Database,
  FileText,
  Github,
  Info,
  Layers,
  Play,
} from 'lucide-vue-next'
import { API_DOCS_URL, REPOSITORY_URL } from '~/constants/site'

// Public page P-07: developer resources, quick start and main API routes (spec §10, §16).
useHead({ title: 'Ressources développeurs' })

const QUICK_START = `git clone ${REPOSITORY_URL}…/astro-assistant.git
cd astro-assistant
docker compose up`

const RESOURCES = [
  {
    icon: Github,
    title: 'Code source',
    text: 'Dépôt public GitHub : /frontend, /backend, tests, licence open source.',
    to: REPOSITORY_URL,
  },
  {
    icon: Code,
    title: 'Swagger /docs',
    text: 'Documentation interactive de l’API, idéale pour injecter des scénarios.',
    to: API_DOCS_URL,
  },
  {
    icon: FileText,
    title: 'ReDoc',
    text: 'Référence complète des routes et schémas Pydantic.',
    to: 'http://localhost:8000/redoc',
  },
  { icon: Play, title: 'Vidéo démo', text: '30 à 60 secondes : problème, solution, démo.', to: '/scenarios' },
  {
    icon: Layers,
    title: 'Deck de présentation',
    text: '10 slides, lisible en 3 minutes (PDF).',
    to: '/fonctionnalites',
  },
  {
    icon: Database,
    title: 'Jeux de données',
    text: 'Extraits DONKI et jeux figés pour la démo.',
    to: '/donnees-nasa',
  },
]

const ROUTES = [
  { method: 'GET', path: '/api/v1/crew', use: 'Équipage et statut global' },
  { method: 'GET', path: '/api/v1/crew/{id}/status', use: 'Statut, scores par domaine, alertes' },
  { method: 'POST', path: '/api/v1/vitals', use: 'Ingestion d’un lot de mesures' },
  { method: 'POST', path: '/api/v1/checkins', use: 'Check-in quotidien' },
  { method: 'GET', path: '/api/v1/alerts?status=active', use: 'File d’alertes (CMO)' },
  { method: 'POST', path: '/api/v1/protocols/{id}/runs', use: 'Démarrer un protocole' },
  { method: 'POST', path: '/api/v1/sync/export', use: 'Générer un paquet sol' },
  { method: 'POST', path: '/api/v1/sim/scenario', use: 'Injecter un scénario S1-S6' },
  { method: 'WS', path: '/api/v1/ws/telemetry', use: 'Flux temps réel' },
]
const METHOD_CLASSES: Record<string, string> = {
  GET: 'bg-primary-soft text-primary',
  POST: 'bg-accent-soft text-accent',
  WS: 'bg-info-soft text-info-ink',
}
const apiRoutes = ROUTES.map((route) => ({ ...route, methodClass: METHOD_CLASSES[route.method] }))

const copied = ref(false)
async function copyQuickStart() {
  await navigator.clipboard.writeText(QUICK_START)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div>
    <SitePageHero
      crumb="Ressources"
      eyebrow="Ressources"
      title="Installer et lancer la démo en moins de 10 minutes"
      intro="Tout le projet démarre en une commande avec Docker Compose. L’API se documente toute seule."
    />

    <div class="mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-2">
      <section aria-labelledby="quick-start">
        <h2 id="quick-start" class="text-2xl font-semibold">Démarrage rapide</h2>
        <div class="mt-4 overflow-hidden rounded-2xl bg-ink text-white shadow-card">
          <div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span class="flex gap-1.5" aria-hidden="true">
              <i class="size-2.5 rounded-full bg-white/25" /><i class="size-2.5 rounded-full bg-white/25" /><i
                class="size-2.5 rounded-full bg-white/25"
              />
            </span>
            <button
              type="button"
              class="rounded p-1 text-white/70 hover:text-white"
              :aria-label="copied ? 'Copié' : 'Copier les commandes'"
              @click="copyQuickStart"
            >
              <component :is="copied ? Check : Copy" :size="15" aria-hidden="true" />
            </button>
          </div>
          <pre
            class="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-6"
          ><span class="text-white/50"># 1. Récupérer le projet</span>
<span class="text-brand-cyan">$</span> git clone {{ REPOSITORY_URL }}…/astro-assistant.git
<span class="text-brand-cyan">$</span> cd astro-assistant

<span class="text-white/50"># 2. Lancer API + interface + base</span>
<span class="text-brand-cyan">$</span> docker compose up

<span class="text-white/50"># 3. Ouvrir</span>
<span class="text-brand-cyan">→</span> http://localhost:3000      <span class="text-white/50">interface</span>
<span class="text-brand-cyan">→</span> http://localhost:8000/docs <span class="text-white/50">Swagger</span></pre>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <NuxtLink
            v-for="resource in RESOURCES"
            :key="resource.title"
            :to="resource.to"
            class="flex items-center gap-3 rounded-2xl border border-divider bg-surface p-4 shadow-card transition-shadow hover:shadow-raised"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
            >
              <component :is="resource.icon" :size="19" aria-hidden="true" />
            </span>
            <span class="flex-1 text-sm">
              <span class="block font-semibold">{{ resource.title }}</span>
              <span class="block text-xs text-ink-muted">{{ resource.text }}</span>
            </span>
            <ChevronRight :size="16" class="text-ink-faint" aria-hidden="true" />
          </NuxtLink>
        </div>
      </section>

      <section aria-labelledby="api-routes">
        <h2 id="api-routes" class="text-2xl font-semibold">API REST & WebSocket</h2>
        <ul
          class="mt-4 divide-y divide-divider rounded-2xl border border-divider bg-surface px-4 shadow-card"
        >
          <li v-for="apiRoute in apiRoutes" :key="apiRoute.path" class="flex items-center gap-3 py-3.5">
            <span
              class="w-12 rounded-md py-1 text-center text-[11px] font-bold"
              :class="apiRoute.methodClass"
              >{{ apiRoute.method }}</span
            >
            <code class="flex-1 text-sm font-semibold">{{ apiRoute.path }}</code>
            <span class="hidden text-xs text-ink-muted sm:inline">{{ apiRoute.use }}</span>
          </li>
        </ul>
        <p class="mt-4 flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm">
          <Info :size="16" class="text-primary" aria-hidden="true" />
          <span
            >Préfixe <b>/api/v1</b> · documentation générée sur <b>/docs</b> (Swagger) et <b>/redoc</b>.</span
          >
        </p>
      </section>
    </div>
  </div>
</template>
