import type { Component } from 'vue'
import {
  ClipboardCheck,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  SlidersHorizontal,
  Sun,
  TriangleAlert,
  Users,
} from 'lucide-vue-next'

export interface NavItem {
  to: string
  label: string
  icon: Component
  /** Route prefix that also marks the item as active (nested pages). */
  match?: string
}

export interface AppModule {
  key: 'crew' | 'cmo' | 'simulation'
  label: string
  to: string
  items: NavItem[]
}

/** Top-level modules of the signed-in app and their sub-navigation. */
export const APP_MODULES: AppModule[] = [
  {
    key: 'crew',
    label: 'Astronaute',
    to: '/equipage',
    items: [
      { to: '/equipage', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/equipage/systemes/cardio', label: 'Systèmes', icon: HeartPulse, match: '/equipage/systemes' },
      { to: '/equipage/check-in', label: 'Check-in', icon: ClipboardCheck },
      { to: '/equipage/protocoles', label: 'Protocoles', icon: ListChecks, match: '/equipage/protocoles' },
      { to: '/equipage/dosimetrie', label: 'Dosimétrie', icon: Sun },
    ],
  },
  {
    key: 'cmo',
    label: 'Médecin de bord',
    to: '/cmo',
    items: [
      { to: '/cmo', label: 'Équipage', icon: Users, match: '/cmo/equipage' },
      { to: '/cmo/alertes', label: 'File d’alertes', icon: TriangleAlert },
    ],
  },
  {
    key: 'simulation',
    label: 'Simulation',
    to: '/simulation',
    items: [{ to: '/simulation', label: 'Scénarios & simulateur', icon: SlidersHorizontal }],
  },
]

/** Public website links (header and footer). */
export const SITE_LINKS = [
  { to: '/#fonctionnalites', label: 'Fonctionnalités' },
  { to: '/#fonctionnement', label: 'Comment ça marche' },
  { to: '/donnees-nasa', label: 'Données NASA' },
  { to: '/scenarios', label: 'Scénarios' },
  { to: '/avertissement', label: 'Limites' },
]
