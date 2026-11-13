import type { Component } from 'vue'
import { Dumbbell, HeartPulse, Shield, Smile, Sun } from 'lucide-vue-next'
import type { Domain } from '~/types/domain'

export interface DomainInfo {
  label: string
  short: string
  icon: Component
}

/** Display metadata for the five risk domains (spec F2.5), in display order. */
export const DOMAINS: Record<Domain, DomainInfo> = {
  cardio: { label: 'Cardiovasculaire', short: 'Cardio', icon: HeartPulse },
  radiation: { label: 'Radiobiologie', short: 'Radiation', icon: Sun },
  musculoskeletal: { label: 'Musculosquelettique', short: 'Musculo', icon: Dumbbell },
  behavioral: { label: 'Comportemental', short: 'Comportement', icon: Smile },
  immune: { label: 'Immunitaire', short: 'Immunitaire', icon: Shield },
}

export const DOMAIN_KEYS = Object.keys(DOMAINS) as Domain[]
