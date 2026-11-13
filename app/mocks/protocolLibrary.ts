import type { Level } from '~/types/domain'

/** CMO view of the versioned protocol library (spec F4.1, F11.2). */
export interface LibraryProtocol {
  code: string
  version: string
  title: string
  level: Level
  updated: string
  validatedBy: string
  duration: string
  trigger: { rule: string; condition: string }
  steps: { title: string; timing: string }[]
  materials: { name: string; status: 'available' | 'low' | 'missing' }[]
  versions: { version: string; note: string }[]
}

export const PROTOCOL_LIBRARY: LibraryProtocol[] = [
  {
    code: 'PRT-RAD-02',
    version: '2.0',
    title: 'Abri radiation',
    level: 'critical',
    updated: 'J+120',
    validatedBy: 'Dr M. Reyes',
    duration: '30 à 120 min',
    trigger: { rule: 'RAD-SPE-01', condition: 'débit > 0,5 mSv/h OU alerte SPE DONKI ≥ classe X' },
    steps: [
      { title: 'Alerter l’équipage et rejoindre le module B2', timing: 'Immédiat' },
      { title: 'Lancer le minuteur d’abri', timing: '30 min minimum' },
      { title: 'Re-mesurer le débit de dose', timing: 'Toutes les 5 min' },
      { title: 'Sortir quand le débit < 0,05 mSv/h sur 2 mesures', timing: 'Critère de sortie' },
      { title: 'Consigner la dose reçue par membre', timing: 'Fin' },
    ],
    materials: [
      { name: 'Dosimètre personnel ×4', status: 'available' },
      { name: 'Kit de survie abri', status: 'available' },
      { name: 'Eau 2 L / pers.', status: 'low' },
    ],
    versions: [
      { version: 'v2.0 · J+120', note: 'Seuil de sortie ajusté' },
      { version: 'v1.1 · J+60', note: 'Ajout re-mesure 5 min' },
      { version: 'v1.0 · J+0', note: 'Version initiale' },
    ],
  },
  {
    code: 'EMRG-01',
    version: '1.4',
    title: 'Premiers secours',
    level: 'critical',
    updated: 'J+98',
    validatedBy: 'Dr M. Reyes',
    duration: '15 min',
    trigger: { rule: 'EMERGENCY', condition: 'mode urgence déclenché OU FC > 120 bpm ET SpO₂ ≤ 90 %' },
    steps: [
      { title: 'Sécuriser la zone et maintenir la personne', timing: 'Immédiat' },
      { title: 'Vérifier conscience et respiration', timing: '1 min' },
      { title: 'Placer l’oxymètre et le brassard', timing: '2 min' },
      { title: 'Oxygène si SpO₂ inférieure à 90 %', timing: '2 min' },
      { title: 'Appeler le médecin de bord', timing: 'Fin' },
    ],
    materials: [
      { name: 'Oxymètre de pouls', status: 'available' },
      { name: 'Oxygène portable', status: 'available' },
      { name: 'Adrénaline auto-injecteur', status: 'low' },
    ],
    versions: [
      { version: 'v1.4 · J+98', note: 'Étape oxygène précisée' },
      { version: 'v1.0 · J+0', note: 'Version initiale' },
    ],
  },
  {
    code: 'PRT-STRESS-01',
    version: '1.3',
    title: 'Respiration guidée',
    level: 'warning',
    updated: 'J+75',
    validatedBy: 'Dr M. Reyes',
    duration: '9 min',
    trigger: { rule: 'HRV-01', condition: 'VFC < 80 % baseline ET stress ≥ 7/10 OU sommeil < 6 h × 3 nuits' },
    steps: [
      { title: 'S’installer au calme, sangles de maintien', timing: '1 min' },
      { title: 'Respiration guidée — cohérence cardiaque', timing: '5 min' },
      { title: 'Mesure de la VFC (60 s)', timing: '1 min' },
      { title: 'Avancer le coucher de 45 min pendant 3 nuits', timing: 'Fin' },
    ],
    materials: [],
    versions: [
      { version: 'v1.3 · J+75', note: 'Durée ramenée à 9 min' },
      { version: 'v1.0 · J+0', note: 'Version initiale' },
    ],
  },
  {
    code: 'PRT-SANS-01',
    version: '1.1',
    title: 'Test visuel guidé',
    level: 'warning',
    updated: 'J+52',
    validatedBy: 'Dr M. Reyes',
    duration: '15 min',
    trigger: { rule: 'SANS-01', condition: 'vision modifiée au check-in ET céphalées 2 jours de suite' },
    steps: [
      { title: 'Mesurer l’acuité visuelle, œil par œil', timing: '4 min' },
      { title: 'Test de la grille d’Amsler', timing: '3 min' },
      { title: 'Imagerie OCT si disponible', timing: '6 min' },
      { title: 'Transmettre les résultats au CMO', timing: 'Fin' },
    ],
    materials: [
      { name: 'Échelle d’acuité visuelle', status: 'available' },
      { name: 'Grille d’Amsler', status: 'available' },
      { name: 'Collyre lubrifiant', status: 'low' },
    ],
    versions: [{ version: 'v1.1 · J+52', note: 'Ajout imagerie OCT' }],
  },
  {
    code: 'PRT-EX-03',
    version: '1.0',
    title: 'Rattrapage exercice',
    level: 'warning',
    updated: 'J+0',
    validatedBy: 'Dr M. Reyes',
    duration: '5 jours',
    trigger: { rule: 'EX-MISSED-01', condition: '≥ 2 séances de résistance manquées consécutives' },
    steps: [
      { title: 'J+1 · ARED 30 min à 70 %', timing: 'Jour 1' },
      { title: 'J+2 · ARED 40 min à 80 %', timing: 'Jour 2' },
      { title: 'J+3 · ARED 45 min + T2 20 min', timing: 'Jour 3' },
      { title: 'Retour au planning nominal', timing: 'Jours 4-5' },
    ],
    materials: [],
    versions: [{ version: 'v1.0 · J+0', note: 'Version initiale' }],
  },
  {
    code: 'PRT-HYD-01',
    version: '1.2',
    title: 'Plan d’hydratation',
    level: 'nominal',
    updated: 'J+40',
    validatedBy: 'Dr M. Reyes',
    duration: '1 jour',
    trigger: { rule: 'HYD-01', condition: 'apport hydrique < 80 % de l’objectif sur 3 jours' },
    steps: [
      { title: 'Rappels toutes les 45 min', timing: 'Journée' },
      { title: 'Objectif 2,5 L sur la journée', timing: 'Journée' },
      { title: 'Réévaluation le lendemain', timing: 'Fin' },
    ],
    materials: [{ name: 'Eau potable de réserve', status: 'low' }],
    versions: [{ version: 'v1.2 · J+40', note: 'Fréquence des rappels ajustée' }],
  },
]
