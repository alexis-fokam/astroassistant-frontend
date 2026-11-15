/**
 * Contract of the Astro Assistant REST API (backend/app/schemas, prefix /api/v1).
 * Snake_case as served by FastAPI; converted to UI types in utils/apiAdapters.ts.
 */

export type ApiLevel = 'nominal' | 'warning' | 'critical'
export type ApiAlertLevel = 'info' | 'warning' | 'critical'
export type ApiDomain = 'global' | 'cardio' | 'radiation' | 'musculoskeletal' | 'behavioral' | 'immune'

export interface ApiMember {
  code: string
  first_name: string
  last_name: string
  crew_role: string
  access_role: 'astronaut' | 'cmo'
  sex: string | null
  mission_start_date: string
}

export interface ApiToken {
  access_token: string
  token_type: string
  expires_in: number
  member: ApiMember
}

export interface ApiProfile {
  code: string
  first_name: string
  last_name: string
  crew_role: string
  is_cmo: boolean
}

export interface ApiMission {
  code: string
  name: string
  destination: string
  start_date: string
  planned_duration_days: number
  one_way_latency_s: number
  mission_day: number
  mission_time: string
  clock: string
  next_contact_at: string | null
  next_contact_in_s: number | null
}

export interface ApiCrewSummary {
  code: string
  first_name: string
  last_name: string
  crew_role: string
  is_cmo: boolean
  status: ApiLevel | null
  global_score: number | null
  top_alert: string | null
}

export interface ApiFactor {
  feature: string
  label?: string
  value: number | string | null
  baseline?: number | null
  contribution: number
}

export interface ApiAlert {
  id: number
  crew_code: string
  level: ApiAlertLevel
  domain: ApiDomain
  domain_label: string | null
  method: string
  rule_code: string | null
  status: 'open' | 'acknowledged' | 'resolved'
  title: string
  message: string
  observed_value: number | null
  threshold: number | null
  factors: ApiFactor[]
  recommended_protocol: string | null
  triggered_at: string
  acknowledged_by: string | null
  acknowledged_at?: string | null
  resolved_at?: string | null
}

export interface ApiCrewStatus {
  crew_id: string
  timestamp: string | null
  status: ApiLevel | null
  global_score: number | null
  domains: Partial<Record<ApiDomain, number>>
  top_factors: ApiFactor[]
  recommended_protocol: string | null
  active_alerts: ApiAlert[]
}

export interface ApiVitalPoint {
  t: string
  value: number
}

export interface ApiVitalLatest {
  metric: string
  value: number | null
  unit: string
  level: ApiLevel
  trend_pct: number | null
  normal_band: { low: number; high: number } | null
  recorded_at: string | null
  points: ApiVitalPoint[]
}

export interface ApiCrewVitals {
  crew_id: string
  vitals: Record<string, ApiVitalLatest>
}

export interface ApiVitalSeries {
  crew_id: string
  metric: string
  unit: string
  baseline_mean: number | null
  points: ApiVitalPoint[]
}

export interface ApiRadiation {
  crew_id: string
  dose_rate_msv_h: number | null
  mission_cumulative_msv: number
  career_used_pct: number
  history: { t: string; dose_rate_msv_h: number; mission_cumulative_msv: number }[]
}

export interface ApiProtocolSummary {
  code: string
  version: string
  title: string
  domain: ApiDomain | null
  severity: ApiAlertLevel
  expected_duration_min: number | null
}

export interface ApiProtocol extends ApiProtocolSummary {
  description: string | null
  trigger: { rules?: string[]; summary?: string }
  checksum: string
  exit_criterion: string | null
  steps: { code: string; title: string; duration_min: number | null; timer: boolean }[]
  materials: { item_code: string; name: string; available: boolean; optional: boolean }[]
  ready: boolean
}

export interface ApiScenario {
  code: string
  name: string
  description: string | null
  expected_level: ApiLevel | null
  expected_protocol_code: string | null
}

export interface ApiExplanation {
  alert_id: number
  rule_code: string | null
  rule: string | null
  any_of: string[]
  factors: ApiFactor[]
  anomaly_score: number | null
  confirmations: number
}

export interface ApiInventoryItem {
  code: string
  name: string
  category: string | null
  unit: string
  quantity: number
  min_quantity: number
  expires_on: string | null
  location: string | null
  is_low_stock: boolean
  is_expired: boolean
}

export interface ApiAuditEntry {
  id: number
  at: string
  actor_label: string
  action: string
  entity_type: string | null
  entity_id: number | null
  details: Record<string, string | number | null | undefined>
  entry_hash: string
}

export interface ApiGroundMessage {
  id: number
  crew_code: string | null
  author: string
  subject: string | null
  body: string
  is_instruction: boolean
  sent_at: string | null
  received_at: string
  read_at: string | null
}

export interface ApiPacket {
  id: number
  crew_code: string | null
  kind: string
  priority: number
  status: string
  size_bytes: number
  sha256: string
  created_at: string
  sent_at: string | null
  received_at_ground: string | null
  in_transit: boolean
}

export interface ApiContactWindow {
  starts_at: string
  ends_at: string
  one_way_latency_s: number
  bandwidth_kbps: number | null
}

export interface ApiRunListItem {
  id: number
  protocol_code: string
  protocol_title: string
  crew_code: string
  severity: ApiAlertLevel
  status: 'in_progress' | 'completed' | 'aborted'
  steps: { code: string }[]
  total_steps: number
  expected_duration_min: number | null
  trigger: string | null
  efficacy: number | null
  started_at?: string
  ended_at?: string | null
}

export interface ApiDomainHistory {
  crew_id: string
  domain: ApiDomain
  score: number | null
  level: ApiLevel | null
  factors: ApiFactor[]
  rules: string[]
  history: { t: string; score: number; level: ApiLevel }[]
}

/** Exécution passée du simulateur (GET /sim/runs). */
export interface ApiSimRun {
  id: number
  scenario_code: string
  crew_code: string | null
  status: 'running' | 'completed' | 'aborted'
  seed: number
  speed_factor: number
  started_at: string
  ended_at: string | null
}

/** Urgence déclenchée à bord (GET /emergency). */
export interface ApiEmergency {
  id: number
  patient_code: string | null
  triggered_by_code: string | null
  status: string
  triggered_at: string
  outcome: string | null
  closed_at: string | null
  summary: string | null
}
