import type { Level } from '~/types/domain'

/** On-board medical inventory (backend table inventory_items, spec F11.1). */
export interface InventoryRow {
  code: string
  name: string
  quantity: number
  capacity: number
  expiry: string | null
  /** Days left before expiry, shown when close (< 60 days). */
  expiresInDays?: number
  location: string
  status: { level: Level; label: string }
  group: 'restock' | 'expiring' | 'ok'
  kit: 'urgence' | 'module-b' | 'other'
}

export const INVENTORY_SUMMARY = { tracked: 48, lowStock: 5, expiringSoon: 2, outOfStock: 1, inStock: 43 }

export const INVENTORY: InventoryRow[] = [
  {
    code: 'MED-PROM-25',
    name: 'Prométhazine 25 mg',
    quantity: 6,
    capacity: 30,
    expiry: '2027-02',
    location: 'Module B · T1',
    status: { level: 'warning', label: 'Stock bas' },
    group: 'restock',
    kit: 'module-b',
  },
  {
    code: 'CONS-BANDAGE',
    name: 'Bande élastique',
    quantity: 0,
    capacity: 6,
    expiry: null,
    location: 'Module B · T3',
    status: { level: 'critical', label: 'Rupture' },
    group: 'restock',
    kit: 'module-b',
  },
  {
    code: 'CONS-WATER',
    name: 'Eau potable de réserve',
    quantity: 18,
    capacity: 40,
    expiry: null,
    location: 'Module A',
    status: { level: 'warning', label: 'Stock bas' },
    group: 'restock',
    kit: 'other',
  },
  {
    code: 'MED-COLLY-LUB',
    name: 'Collyre lubrifiant',
    quantity: 4,
    capacity: 8,
    expiry: '2026-11',
    expiresInDays: 18,
    location: 'Module B · T2',
    status: { level: 'warning', label: 'Expire bientôt' },
    group: 'expiring',
    kit: 'module-b',
  },
  {
    code: 'MED-ADRE-SYR',
    name: 'Adrénaline auto-injecteur',
    quantity: 3,
    capacity: 4,
    expiry: '2026-12',
    expiresInDays: 41,
    location: 'Kit urgence',
    status: { level: 'warning', label: 'Expire bientôt' },
    group: 'expiring',
    kit: 'urgence',
  },
  {
    code: 'MED-PARA-500',
    name: 'Paracétamol 500 mg',
    quantity: 46,
    capacity: 60,
    expiry: '2027-08',
    location: 'Module B · T1',
    status: { level: 'nominal', label: 'OK' },
    group: 'ok',
    kit: 'module-b',
  },
  {
    code: 'EQ-O2-PORT',
    name: 'Oxygène portable',
    quantity: 1,
    capacity: 2,
    expiry: null,
    location: 'Module A · mur',
    status: { level: 'nominal', label: 'OK' },
    group: 'ok',
    kit: 'urgence',
  },
  {
    code: 'MED-MELA-3',
    name: 'Mélatonine 3 mg',
    quantity: 22,
    capacity: 40,
    expiry: '2027-10',
    location: 'Module B · T1',
    status: { level: 'nominal', label: 'OK' },
    group: 'ok',
    kit: 'module-b',
  },
]
