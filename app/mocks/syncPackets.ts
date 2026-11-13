import type { Level } from '~/types/domain'

/** Export queue (backend table sync_packets, spec F10.1-F10.2). */
export interface SyncPacket {
  id: number
  content: string
  level: Level
  sha256: string
  size: string
  createdAt: string
}

export const SYNC_PACKETS: SyncPacket[] = [
  {
    id: 5,
    content: 'Urgence AV-03 · constantes + étapes',
    level: 'critical',
    sha256: 'a91f…3c0e',
    size: '18 Ko',
    createdAt: 'J+142 14:26',
  },
  {
    id: 4,
    content: 'Événement SPE · doses équipage',
    level: 'critical',
    sha256: '5be2…77d1',
    size: '42 Ko',
    createdAt: 'J+142 14:05',
  },
  {
    id: 3,
    content: 'Alerte SANS AV-04 + consultation',
    level: 'warning',
    sha256: 'e04c…19aa',
    size: '9 Ko',
    createdAt: 'J+142 10:22',
  },
  {
    id: 2,
    content: 'Synthèse quotidienne équipage',
    level: 'info',
    sha256: '7f3d…c2b8',
    size: '126 Ko',
    createdAt: 'J+142 06:00',
  },
  {
    id: 1,
    content: 'Séries temporelles CSV · 24 h',
    level: 'info',
    sha256: '02ad…9e41',
    size: '1,8 Mo',
    createdAt: 'J+142 06:00',
  },
]

/** Contact windows over the next 30 h, in hours from J+142 00:00 (spec F10.3). */
export const CONTACT_WINDOWS = [
  { from: 6.17, to: 7.5, label: '06:10 · envoyé', state: 'past' as const },
  { from: 16.3, to: 17.07, label: '16:19 → 17:04', state: 'next' as const },
  { from: 27.67, to: 28.42, label: 'J+143 03:40', state: 'planned' as const },
]
