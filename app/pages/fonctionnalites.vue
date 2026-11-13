<script setup lang="ts">
import {
  ClipboardCheck,
  Dumbbell,
  FileText,
  HeartPulse,
  ListChecks,
  Moon,
  Pill,
  RadioTower,
  ScanLine,
  Siren,
  SlidersHorizontal,
  Sun,
  Timer,
  Users,
  Utensils,
} from 'lucide-vue-next'
import type { Component } from 'vue'

// Public page P-02: the fifteen functions F1-F15 grouped by purpose, with MoSCoW priority.
useHead({ title: 'Fonctionnalités' })

type Priority = 'Must' | 'Should' | 'Could'

interface Feature {
  id: string
  title: string
  text: string
  icon: Component
  priority: Priority
}

const GROUPS: { title: string; features: Feature[] }[] = [
  {
    title: 'Surveiller',
    features: [
      {
        id: 'F1',
        title: 'Tableau de bord clinique',
        text: 'Statut global en moins de 3 s, constantes et tendances en temps réel.',
        icon: HeartPulse,
        priority: 'Must',
      },
      {
        id: 'F2',
        title: 'Moteur IA & score de risque',
        text: 'Baseline individuelle, Isolation Forest, règles cliniques explicables.',
        icon: ScanLine,
        priority: 'Must',
      },
      {
        id: 'F5',
        title: 'Dosimétrie & météo spatiale',
        text: 'Dose cumulée vs limite de carrière, éruptions rejouées depuis DONKI.',
        icon: Sun,
        priority: 'Must',
      },
      {
        id: 'F7',
        title: 'Sommeil & fatigue',
        text: 'Dette de sommeil, désalignement circadien, créneaux à risque.',
        icon: Moon,
        priority: 'Should',
      },
      {
        id: 'F8',
        title: 'Test de vigilance (PVT)',
        text: 'Temps de réaction médian et lapses en 3 minutes.',
        icon: Timer,
        priority: 'Could',
      },
    ],
  },
  {
    title: 'Agir',
    features: [
      {
        id: 'F3',
        title: 'Check-in quotidien',
        text: 'Moins de 90 s, gros boutons, aucune saisie obligatoire.',
        icon: ClipboardCheck,
        priority: 'Must',
      },
      {
        id: 'F4',
        title: 'Protocoles de contre-mesures',
        text: 'Chaque alerte devient un plan d’action pas à pas.',
        icon: ListChecks,
        priority: 'Must',
      },
      {
        id: 'F6',
        title: 'Exercices de contre-mesure',
        text: 'Planning, adhérence et plan de rattrapage.',
        icon: Dumbbell,
        priority: 'Should',
      },
      {
        id: 'F12',
        title: 'Mode urgence',
        text: 'Plein écran, deux gestes, équipage et sol alertés.',
        icon: Siren,
        priority: 'Must',
      },
      {
        id: 'F13',
        title: 'Nutrition & hydratation',
        text: 'Portions prédéfinies, rappels d’hydratation.',
        icon: Utensils,
        priority: 'Could',
      },
    ],
  },
  {
    title: 'Coordonner',
    features: [
      {
        id: 'F9',
        title: 'Vue médecin de bord',
        text: 'Équipage, file d’alertes triée, journal médical, accès par PIN.',
        icon: Users,
        priority: 'Must',
      },
      {
        id: 'F10',
        title: 'Synchronisation différée',
        text: 'Store-and-forward, priorités, empreintes SHA-256.',
        icon: RadioTower,
        priority: 'Should',
      },
      {
        id: 'F11',
        title: 'Pharmacie de bord',
        text: 'Inventaire, péremptions, lien protocole → matériel.',
        icon: Pill,
        priority: 'Could',
      },
      {
        id: 'F14',
        title: 'Journal & rapports',
        text: 'Audit non modifiable, rapports PDF/JSON, export CSV.',
        icon: FileText,
        priority: 'Should',
      },
    ],
  },
  {
    title: 'Démontrer',
    features: [
      {
        id: 'F15',
        title: 'Simulateur & mode jury',
        text: 'Télémétrie réaliste, temps accéléré ×1000, scénarios S1-S6.',
        icon: SlidersHorizontal,
        priority: 'Must',
      },
    ],
  },
]

const PRIORITY_CLASSES: Record<Priority, string> = {
  Must: 'bg-primary text-white',
  Should: 'bg-primary-soft text-primary',
  Could: 'bg-subtle text-ink-muted',
}
</script>

<template>
  <div>
    <SitePageHero
      crumb="Fonctionnalités"
      eyebrow="Fonctionnalités · F1 à F15"
      title="Quinze fonctions pour un médecin de bord autonome"
      intro="Priorisées selon la méthode MoSCoW : Must pour la démo, Should si le temps le permet, Could en évolution."
    />

    <div class="mx-auto max-w-6xl space-y-12 px-6 pb-20">
      <section v-for="group in GROUPS" :key="group.title" :aria-labelledby="`group-${group.title}`">
        <h2 :id="`group-${group.title}`" class="flex items-baseline gap-2 text-2xl font-semibold">
          {{ group.title }}
          <span class="text-xs font-normal text-ink-muted">{{ group.features.length }} fonctionnalités</span>
        </h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="feature in group.features"
            :key="feature.id"
            class="rounded-2xl border border-divider bg-surface p-5 shadow-card"
          >
            <div class="flex items-start justify-between">
              <span class="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <component :is="feature.icon" :size="19" :stroke-width="1.7" aria-hidden="true" />
              </span>
              <span class="flex items-center gap-2 text-xs text-ink-muted">
                {{ feature.id }}
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="PRIORITY_CLASSES[feature.priority]"
                >
                  {{ feature.priority }}
                </span>
              </span>
            </div>
            <h3 class="mt-4 font-semibold">{{ feature.title }}</h3>
            <p class="mt-1 text-sm text-ink-muted">{{ feature.text }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
