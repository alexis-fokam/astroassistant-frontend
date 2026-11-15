<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  Brain,
  ClipboardCheck,
  Database,
  Earth,
  Gauge,
  HeartPulse,
  ListChecks,
  Orbit,
  Play,
  Radiation,
  RadioTower,
  Satellite,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
} from 'lucide-vue-next'

// Page d'accueil publique (P-01) : scène 3D de l'équipage, problème, solution, données, démo.
useHead({ title: 'Le médecin de bord intelligent' })

const { scenarios } = useMissionData()

// Chiffres mesurés par l'évaluation du moteur (backend/docs/evaluation.json).
const KEY_FIGURES = [
  { value: '100 %', label: 'anomalies détectées (19/19)' },
  { value: '0', label: 'fausse alerte sur 306 h' },
  { value: '36 ms', label: 'par analyse IA' },
  { value: '1,2 Mo', label: 'modèle par astronaute' },
]

// The five hazards of human spaceflight (NASA HRP "RIDGE"), spec §2.
const HAZARDS = [
  { letter: 'R', icon: Radiation, title: 'Radiation', watch: 'Dose cumulée, débit, alertes SPE' },
  { letter: 'I', icon: Users, title: 'Isolement', watch: 'Stress, sommeil, humeur, vigilance' },
  { letter: 'D', icon: Earth, title: 'Distance', watch: '100 % local, synchronisation différée' },
  { letter: 'G', icon: Orbit, title: 'Gravité', watch: 'Perte osseuse, exercice, vision' },
  { letter: 'E', icon: ShieldAlert, title: 'Environnement', watch: 'Température, CO₂, immunité' },
]

const PIPELINE = [
  {
    icon: Activity,
    title: 'Détecter',
    text: 'Baseline individuelle, z-score robuste et Isolation Forest repèrent les dérives tôt.',
  },
  {
    icon: Brain,
    title: 'Expliquer',
    text: 'Chaque alerte affiche ses 3 facteurs principaux et la règle qui l’a déclenchée.',
  },
  {
    icon: ListChecks,
    title: 'Guider',
    text: 'Un protocole pas à pas, lisible sous stress, pour chaque alerte WARNING ou CRITICAL.',
  },
  {
    icon: Send,
    title: 'Transmettre',
    text: 'Une synthèse compressée et signée part vers la Terre à chaque fenêtre de contact.',
  },
]

const FEATURES = [
  {
    icon: Gauge,
    title: 'Tableau de bord clinique',
    text: 'Statut global en moins de 3 secondes, puis cartes par système.',
  },
  {
    icon: Sparkles,
    title: 'IA explicable embarquée',
    text: 'Scores de risque par domaine, calculés sur l’appareil, sans réseau.',
  },
  {
    icon: ClipboardCheck,
    title: 'Check-in quotidien',
    text: 'Dix questions en gros boutons pour ce que les capteurs ne voient pas.',
  },
  {
    icon: Sun,
    title: 'Dosimétrie & météo spatiale',
    text: 'Dose de carrière, éruptions rejouées depuis DONKI, compte à rebours d’abri.',
  },
  {
    icon: Stethoscope,
    title: 'Vue médecin de bord',
    text: 'Équipage, file d’alertes triée, journal médical et pharmacie.',
  },
  {
    icon: RadioTower,
    title: 'Liaison sol différée',
    text: 'File d’export priorisée, empreinte SHA-256, consignes du flight surgeon.',
  },
]

// Jeux de données réellement utilisés (backend/app/datasets/catalog.py).
const NASA_SOURCES = [
  {
    icon: Radiation,
    name: 'Curiosity RAD (NASA)',
    text: '5 117 mesures de dose sur la route de Mars : seuil de tempête.',
  },
  {
    icon: Satellite,
    name: 'NASA DONKI',
    text: '502 éruptions et événements à particules, rejoués localement.',
  },
  { icon: Sun, name: 'NOAA GOES', text: 'Flux de protons : alerte précoce dès 10 pfu (échelle S1).' },
  {
    icon: Database,
    name: 'PhysioNet et WESAD',
    text: 'Données humaines réelles pour vérifier les seuils médicaux.',
  },
]
</script>

<template>
  <div>
    <!-- Hero : scène 3D animée de l'équipage en orbite -->
    <section class="relative overflow-hidden bg-[#0b1530] text-white">
      <div
        class="pointer-events-none absolute inset-0"
        style="
          background:
            radial-gradient(circle at 75% 45%, rgb(70 182 246 / 0.22), transparent 55%),
            radial-gradient(circle at 15% 85%, rgb(155 92 242 / 0.25), transparent 50%);
        "
      />
      <div
        class="relative mx-auto grid max-w-7xl items-center gap-6 px-6 pt-14 pb-16 lg:grid-cols-[1fr_1.15fr]"
      >
        <div class="relative z-10">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#c9b3f9]"
          >
            <Sparkles :size="14" aria-hidden="true" /> NASA Space Apps Challenge 2026
          </span>
          <h1 class="mt-5 text-[42px] leading-[1.08] font-bold md:text-[54px]">
            Un médecin de bord intelligent, même à
            <span class="text-brand-gradient">22 minutes</span> de la Terre.
          </h1>
          <p class="mt-5 max-w-xl text-lg text-[#bfd0ea]">
            Astro Assistant veille en continu sur la santé de chaque astronaute. Son IA détecte les anomalies,
            explique pourquoi et propose le bon protocole, sans attendre le sol.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UiButton size="lg" to="/simulation" :icon="Play">Lancer la démo</UiButton>
            <NuxtLink
              to="/connexion"
              class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 px-5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Se connecter <ArrowRight :size="18" aria-hidden="true" />
            </NuxtLink>
          </div>
          <dl class="mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
            <div v-for="figure in KEY_FIGURES" :key="figure.label" class="flex flex-col-reverse justify-end">
              <dt class="mt-0.5 text-xs text-[#a9b8d6]">{{ figure.label }}</dt>
              <dd class="font-display text-2xl font-bold tabular">{{ figure.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="relative h-[380px] sm:h-[480px] lg:h-[620px]">
          <ClientOnly>
            <HeroAstroScene />
            <template #fallback>
              <div class="flex size-full items-center justify-center">
                <BrandMark :size="180" />
              </div>
            </template>
          </ClientOnly>
          <!-- Étiquettes « en direct » posées sur la scène -->
          <div
            class="absolute top-6 left-2 flex items-center gap-2 rounded-xl border border-white/15 bg-[#0b1530]/70 px-3 py-2 text-sm backdrop-blur"
          >
            <span class="size-2 animate-pulse rounded-full bg-nominal" aria-hidden="true" />
            4 astronautes surveillés · hors ligne
          </div>
          <div
            class="absolute right-2 bottom-8 flex items-center gap-3 rounded-xl border border-white/15 bg-[#0b1530]/70 px-4 py-3 backdrop-blur"
          >
            <HeartPulse :size="20" class="text-warning" aria-hidden="true" />
            <div>
              <p class="text-sm font-semibold">AV-02 · VFC en baisse</p>
              <p class="text-xs text-[#a9b8d6]">WARNING · protocole PRT-STRESS-01 proposé</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem: RIDGE hazards -->
    <section class="bg-canvas py-20">
      <div class="mx-auto max-w-6xl px-6">
        <p class="text-sm font-semibold text-primary">Le problème</p>
        <h2 class="mt-2 text-3xl font-bold">Cinq dangers, aucun médecin à portée</h2>
        <p class="mt-3 max-w-2xl text-ink-muted">
          La NASA regroupe les risques du vol habité en cinq familles. Avec plusieurs minutes de latence et
          des fenêtres de contact intermittentes, l’équipage doit détecter, comprendre et agir seul.
        </p>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article
            v-for="hazard in HAZARDS"
            :key="hazard.title"
            class="rounded-xl border border-divider bg-surface p-5 shadow-card"
          >
            <div class="flex items-center justify-between">
              <span class="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <component :is="hazard.icon" :size="20" :stroke-width="1.75" aria-hidden="true" />
              </span>
              <span class="font-display text-3xl font-bold text-divider" aria-hidden="true">{{
                hazard.letter
              }}</span>
            </div>
            <h3 class="mt-4 font-semibold">{{ hazard.title }}</h3>
            <p class="mt-1 text-sm text-ink-muted">{{ hazard.watch }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="fonctionnement" class="py-20">
      <div class="mx-auto max-w-6xl px-6">
        <p class="text-sm font-semibold text-primary">Comment ça marche</p>
        <h2 class="mt-2 text-3xl font-bold">Détecter, expliquer, guider, transmettre</h2>
        <ol class="mt-10 grid gap-4 md:grid-cols-4">
          <li
            v-for="(step, index) in PIPELINE"
            :key="step.title"
            class="rounded-xl border border-divider bg-surface p-5 shadow-card"
          >
            <span class="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-white">
              <component :is="step.icon" :size="19" :stroke-width="2" aria-hidden="true" />
            </span>
            <h3 class="mt-4 font-semibold">
              <span class="text-ink-faint">{{ index + 1 }}.</span> {{ step.title }}
            </h3>
            <p class="mt-1 text-sm text-ink-muted">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Features -->
    <section id="fonctionnalites" class="bg-canvas py-20">
      <div class="mx-auto max-w-6xl px-6">
        <p class="text-sm font-semibold text-primary">Fonctionnalités</p>
        <h2 class="mt-2 text-3xl font-bold">Tout ce dont l’équipage a besoin, à bord</h2>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="feature in FEATURES"
            :key="feature.title"
            class="rounded-xl border border-divider bg-surface p-6 shadow-card"
          >
            <component
              :is="feature.icon"
              :size="22"
              :stroke-width="1.75"
              class="text-primary"
              aria-hidden="true"
            />
            <h3 class="mt-4 font-semibold">{{ feature.title }}</h3>
            <p class="mt-1 text-sm text-ink-muted">{{ feature.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- NASA open data and demo scenarios -->
    <section class="py-20">
      <div class="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
        <div>
          <p class="text-sm font-semibold text-primary">Données ouvertes</p>
          <h2 class="mt-2 text-3xl font-bold">Une base scientifique crédible</h2>
          <p class="mt-3 text-ink-muted">
            Les ressources de la NASA calibrent le simulateur et les seuils. Elles sont embarquées localement.
          </p>
          <div class="mt-8 grid gap-3 sm:grid-cols-2">
            <article
              v-for="source in NASA_SOURCES"
              :key="source.name"
              class="rounded-xl border border-divider p-4"
            >
              <component
                :is="source.icon"
                :size="20"
                :stroke-width="1.75"
                class="text-accent"
                aria-hidden="true"
              />
              <h3 class="mt-3 text-sm font-semibold">{{ source.name }}</h3>
              <p class="mt-1 text-sm text-ink-muted">{{ source.text }}</p>
            </article>
          </div>
          <UiButton class="mt-6" variant="secondary" to="/donnees-nasa" :icon-right="ArrowRight">
            En savoir plus
          </UiButton>
        </div>
        <div>
          <p class="text-sm font-semibold text-primary">Démo jury</p>
          <h2 class="mt-2 text-3xl font-bold">Rejouez six situations réelles</h2>
          <p class="mt-3 text-ink-muted">
            Chaque scénario montre la réaction du système, de l’alerte jusqu’au protocole.
          </p>
          <ul class="mt-8 divide-y divide-divider rounded-xl border border-divider">
            <li v-for="scenario in scenarios" :key="scenario.code" class="flex items-center gap-4 px-4 py-3">
              <span class="w-8 font-display text-sm font-semibold text-ink-muted">{{ scenario.code }}</span>
              <span class="flex-1 text-sm font-medium">{{ scenario.name }}</span>
              <UiStatusBadge :level="scenario.expected" />
            </li>
          </ul>
          <UiButton class="mt-6" to="/simulation" :icon="Play">Lancer un scénario</UiButton>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="pb-20">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex flex-col gap-4 rounded-2xl bg-info-soft p-6 md:flex-row md:items-center">
          <HeartPulse :size="28" :stroke-width="1.75" class="shrink-0 text-info-ink" aria-hidden="true" />
          <p class="flex-1 text-sm">
            <b>Prototype de hackathon.</b> Astro Assistant n’est pas un dispositif médical certifié. Les
            seuils et recommandations doivent être validés par des professionnels de santé spatiale. Le
            système oriente, il ne prescrit pas.
          </p>
          <UiButton variant="secondary" size="sm" to="/avertissement">Lire les limites</UiButton>
        </div>
      </div>
    </section>
  </div>
</template>
