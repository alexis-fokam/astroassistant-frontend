import type { Level } from '~/types/domain'

/** Append-only audit trail (backend table audit_logs, spec F14.1). */
export interface AuditEntry {
  at: string
  actor: string
  level: Level
  action: string
  object: string
  hash: string
}

export const AUDIT_SUMMARY = { entries: '1 284', verifiedAt: '14:26' }

export const AUDIT_LOG: AuditEntry[] = [
  {
    at: 'J+142 14:26:03',
    actor: 'Système',
    level: 'info',
    action: 'sync.enqueue',
    object: 'Paquet a91f…3c0e · CRITICAL',
    hash: '9c1e…44fa',
  },
  {
    at: 'J+142 14:22:08',
    actor: 'Léo Martin',
    level: 'critical',
    action: 'emergency.trigger',
    object: 'Urgence AV-03 · confirmé 2 gestes',
    hash: '3b7d…e021',
  },
  {
    at: 'J+142 14:05:32',
    actor: 'Moteur IA',
    level: 'critical',
    action: 'alert.create',
    object: 'RAD-SPE-01 · équipage',
    hash: 'f20a…71c3',
  },
  {
    at: 'J+142 10:22:40',
    actor: 'Kenji Arai',
    level: 'warning',
    action: 'alert.ack',
    object: 'SANS AV-04 · commentaire',
    hash: '81be…0d9a',
  },
  {
    at: 'J+142 08:41:15',
    actor: 'Léo Martin',
    level: 'nominal',
    action: 'protocol.step',
    object: 'PRT-STRESS-01 · étape 1',
    hash: 'c4d2…b8e7',
  },
  {
    at: 'J+142 08:04:51',
    actor: 'Kenji Arai',
    level: 'nominal',
    action: 'checkin.submit',
    object: 'Check-in · 71 s',
    hash: '07aa…5f12',
  },
  {
    at: 'J+142 06:12:09',
    actor: 'Moteur IA',
    level: 'warning',
    action: 'alert.create',
    object: 'HRV-01 · AV-02',
    hash: 'e9f0…2c6b',
  },
]
