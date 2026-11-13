import type { Scenario } from '~/types/domain'

/** Demo scenarios S1-S6 (spec §4.1), mirroring the backend seed. */
export const SCENARIOS: Scenario[] = [
  {
    code: 'S1',
    name: 'Journée nominale',
    description: 'Paramètres stables, statut vert, rappels d’exercice et de check-in.',
    expected: 'nominal',
    protocol: null,
  },
  {
    code: 'S2',
    name: 'Stress et dette de sommeil',
    description: 'VFC en baisse sur 3 jours et sommeil < 6 h.',
    expected: 'warning',
    protocol: 'PRT-STRESS-01',
  },
  {
    code: 'S3',
    name: 'Événement à particules solaires',
    description: 'Pic de débit de dose : abri immédiat et minuteur.',
    expected: 'critical',
    protocol: 'PRT-RAD-02',
  },
  {
    code: 'S4',
    name: 'Suspicion SANS',
    description: 'Vision floue et maux de tête répétés : test visuel guidé.',
    expected: 'warning',
    protocol: 'PRT-SANS-01',
  },
  {
    code: 'S5',
    name: 'Déconditionnement',
    description: 'Séances manquées : projection de perte osseuse aggravée.',
    expected: 'warning',
    protocol: 'PRT-EX-03',
  },
  {
    code: 'S6',
    name: 'Fenêtre de contact',
    description: 'Paquet de synthèse transmis au sol, consigne reçue.',
    expected: 'info',
    protocol: null,
  },
]
