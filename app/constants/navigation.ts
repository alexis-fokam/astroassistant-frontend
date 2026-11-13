import type { Component } from 'vue'
import {
  Box,
  CalendarDays,
  ClipboardCheck,
  Code,
  Dumbbell,
  Ellipsis,
  FolderHeart,
  HeartPulse,
  Inbox,
  Layers,
  LayoutDashboard,
  ListChecks,
  Moon,
  Pill,
  RadioTower,
  Shield,
  SlidersHorizontal,
  Sun,
  Timer,
  TriangleAlert,
  Users,
} from 'lucide-vue-next'

export interface NavItem {
  to: string
  label: string
  icon: Component
  /** Route prefix(es) that also mark the item as active (nested or grouped pages). */
  match?: string | string[]
}

export interface AppModule {
  key: 'crew' | 'cmo' | 'ground' | 'simulation'
  label: string
  to: string
  items: NavItem[]
}

/** Top-level modules of the signed-in app and their sub-navigation. */
export const APP_MODULES: AppModule[] = [
  {
    key: 'crew',
    label: 'Équipage',
    to: '/equipage',
    items: [
      { to: '/equipage', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/equipage/systemes/cardio', label: 'Systèmes', icon: HeartPulse, match: '/equipage/systemes' },
      { to: '/equipage/check-in', label: 'Check-in', icon: ClipboardCheck, match: '/equipage/check-in' },
      { to: '/equipage/protocoles', label: 'Protocoles', icon: ListChecks, match: '/equipage/protocoles' },
      { to: '/equipage/dosimetrie', label: 'Dosimétrie', icon: Sun },
      { to: '/equipage/exercices', label: 'Exercices', icon: Dumbbell },
      { to: '/equipage/sommeil', label: 'Sommeil', icon: Moon },
      { to: '/equipage/pvt', label: 'Test PVT', icon: Timer },
      {
        to: '/equipage/messages',
        label: 'Plus',
        icon: Ellipsis,
        match: ['/equipage/messages', '/equipage/parametres'],
      },
    ],
  },
  {
    key: 'cmo',
    label: 'Médecin de bord',
    to: '/cmo',
    items: [
      { to: '/cmo', label: 'Équipage', icon: Users },
      { to: '/cmo#alertes', label: 'File d’alertes', icon: TriangleAlert, match: '/cmo/cloture-urgence' },
      {
        to: '/cmo/equipage/AV-02',
        label: 'Dossiers médicaux',
        icon: FolderHeart,
        match: ['/cmo/equipage', '/cmo/consultation'],
      },
      { to: '/cmo/protocoles', label: 'Protocoles', icon: ListChecks },
      { to: '/cmo/pharmacie', label: 'Pharmacie', icon: Pill },
      { to: '/cmo/audit', label: 'Journal d’audit', icon: Shield },
    ],
  },
  {
    key: 'ground',
    label: 'Liaison sol',
    to: '/sol',
    items: [
      { to: '/sol', label: 'Synchronisation', icon: RadioTower },
      { to: '/sol/consignes', label: 'Consignes du sol', icon: Inbox },
      { to: '/sol#paquets', label: 'Paquets', icon: Box },
      { to: '/sol#fenetres', label: 'Fenêtres de contact', icon: CalendarDays },
    ],
  },
  {
    key: 'simulation',
    label: 'Simulation',
    to: '/simulation',
    items: [
      { to: '/simulation', label: 'Scénarios', icon: Layers },
      { to: '/simulation#controle', label: 'Panneau de contrôle', icon: SlidersHorizontal },
      { to: '/simulation/journal', label: 'Journal moteur', icon: Code },
    ],
  },
]
