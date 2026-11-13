import type { CrewMember } from '~/types/domain'

/** Fictional crew, identical to the backend seed (backend/app/seed.py). */
export const CREW: CrewMember[] = [
  {
    code: 'AV-01',
    tone: 1,
    firstName: 'Nadia',
    lastName: 'Okafor',
    initials: 'NO',
    role: 'Commandante',
    isCmo: false,
    score: 41,
    level: 'warning',
    domains: { cardio: 22, radiation: 24, musculoskeletal: 52, behavioral: 30, immune: 15 },
    topAlert: '3 séances ARED manquées',
  },
  {
    code: 'AV-02',
    tone: 2,
    firstName: 'Léo',
    lastName: 'Martin',
    initials: 'LM',
    role: 'Ingénieur de vol',
    isCmo: false,
    score: 54,
    level: 'warning',
    domains: { cardio: 61, radiation: 22, musculoskeletal: 35, behavioral: 68, immune: 18 },
    topAlert: 'VFC basse persistante',
  },
  {
    code: 'AV-03',
    tone: 3,
    firstName: 'Sara',
    lastName: 'Lindqvist',
    initials: 'SL',
    role: 'Spécialiste de mission',
    isCmo: false,
    score: 81,
    level: 'critical',
    domains: { cardio: 84, radiation: 25, musculoskeletal: 28, behavioral: 40, immune: 21 },
    topAlert: 'Tachycardie 128 bpm · SpO₂ 92 %',
  },
  {
    code: 'AV-04',
    tone: 4,
    firstName: 'Kenji',
    lastName: 'Arai',
    initials: 'KA',
    role: 'Médecin de bord (CMO)',
    isCmo: true,
    score: 47,
    level: 'warning',
    domains: { cardio: 30, radiation: 23, musculoskeletal: 26, behavioral: 34, immune: 20 },
    topAlert: 'Suspicion SANS (vision)',
  },
]

/** Profile shown as "current user" in the astronaut space (scenario S2). */
export const CURRENT_CREW_CODE = 'AV-02'
