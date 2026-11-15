/**
 * Domain models shared by the UI. They mirror the backend SQLAlchemy models
 * (backend/app/models) so the mock layer can later be swapped for the REST API.
 */

/** Three-level health status (spec F1.1), plus `info` for non-clinical notices. */
export type Level = 'nominal' | 'warning' | 'critical' | 'info'

/** Risk domains scored by the AI engine (spec F2.5). */
export type Domain = 'cardio' | 'radiation' | 'musculoskeletal' | 'behavioral' | 'immune'

export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export interface Mission {
  name: string
  day: number
  clock: string
  nextContact: string
  latencyMin: number
}

export interface CrewMember {
  code: string
  firstName: string
  lastName: string
  initials: string
  /** Avatar colour, 1-4 (design token --color-crew-N). */
  tone: number
  role: string
  isCmo: boolean
  /** Global risk score, 0-100 (higher means riskier). */
  score: number
  level: Level
  domains: Record<Domain, number>
  topAlert: string | null
}

export interface Alert {
  id: number
  level: Level
  crew: string
  domain: Domain
  /** Display label when the clinical area is narrower than the risk domain (e.g. SANS). */
  domainLabel?: string
  title: string
  detail: string
  protocol: string | null
  since: string
  status: AlertStatus
  /** Crew member code following up the alert (usually the CMO). */
  assignee?: string
}

export interface ProtocolStep {
  /** Step code in the protocol YAML (validated through the API). */
  code?: string
  title: string
  minutes: number
  /** Step shows a countdown timer in the protocol player. */
  timer?: boolean
}

export interface ProtocolMaterial {
  name: string
  available: boolean
  optional?: boolean
}

export interface Protocol {
  code: string
  version: string
  title: string
  level: Level
  domain: Domain | null
  minutes: number
  summary: string
  exitCriterion: string
  steps: ProtocolStep[]
  materials: ProtocolMaterial[]
}

/** Latest value of a vital sign with its recent history (spec F1.2, F1.7). */
export interface VitalSnapshot {
  id: string
  label: string
  value: string
  unit: string
  level: Level
  trend: string
  trendUp: boolean
  values: number[]
  /** Normal range drawn behind the curve. */
  band?: [number, number]
  min?: number
  max?: number
}

export interface ExplanationFactor {
  label: string
  value: string
  /** Share of the score explained by this factor, 0-1. */
  contribution: number
}

/** Why an alert fired (spec F2.7). */
export interface AlertExplanation {
  factors: ExplanationFactor[]
  rule: string
  /** Isolation Forest output, 0-1. */
  anomalyScore: number
  /** WARNING alerts need two consecutive confirmations (spec §6.3). */
  confirmations: number
}

export interface Scenario {
  code: string
  name: string
  description: string
  expected: Level
  protocol: string | null
}
