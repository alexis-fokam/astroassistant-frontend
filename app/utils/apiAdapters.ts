/**
 * Converters from the REST API payloads (types/api.ts) to the UI domain types
 * (types/domain.ts): French labels, initials, avatar tones, relative times, number formats.
 */
import type {
  ApiAlert,
  ApiCrewStatus,
  ApiCrewSummary,
  ApiExplanation,
  ApiFactor,
  ApiMission,
  ApiProfile,
  ApiProtocol,
  ApiRadiation,
  ApiScenario,
  ApiVitalLatest,
  ApiVitalSeries,
} from '~/types/api'
import type {
  Alert,
  AlertExplanation,
  CrewMember,
  Domain,
  Level,
  Mission,
  Protocol,
  Scenario,
  VitalSnapshot,
} from '~/types/domain'

const DOMAINS: Domain[] = ['cardio', 'radiation', 'musculoskeletal', 'behavioral', 'immune']

const ROLE_LABELS: Record<string, string> = {
  commander: 'Commandant·e',
  pilot: 'Pilote',
  flight_engineer: 'Ingénieur·e de vol',
  mission_specialist: 'Spécialiste de mission',
  payload_specialist: 'Spécialiste charge utile',
}

/** Labels of engine features, for factors stored without a label. */
const FEATURE_LABELS: Record<string, string> = {
  hrv_ratio: 'VFC / baseline',
  hrv_rmssd: 'VFC RMSSD',
  hr_z: 'FC au repos (z-score)',
  heart_rate: 'Fréquence cardiaque',
  spo2: 'SpO₂',
  spo2_now: 'SpO₂',
  respiratory_rate: 'Fréquence respiratoire',
  sleep_hours: 'Dette de sommeil',
  short_nights_3n: 'Nuits de moins de 6 h',
  stress: 'Stress déclaré',
  ared_missed: 'Séances ARED manquées',
  missed_resistance_streak: 'Séances de résistance manquées',
  activity_level: 'Activité moyenne',
  vision_change: 'Vision modifiée',
  headache: 'Céphalées',
  systolic_bp: 'Pression systolique',
  dose_rate_msv_h: 'Débit de dose',
  anomaly_score: 'Anomalie multivariée',
}

const number = (value: number, digits = 0) =>
  value.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

/** Avatar colour 1-4 from the crew code (AV-03 → 3). */
export function toneOf(code: string): number {
  const digit = Number(code.slice(-1))
  return Number.isFinite(digit) && digit > 0 ? ((digit - 1) % 4) + 1 : 1
}

export function roleLabel(role: string, isCmo: boolean): string {
  return isCmo ? 'Médecin de bord (CMO)' : (ROLE_LABELS[role] ?? role)
}

/** "il y a 4 min", "il y a 2 h", "hier", "il y a 3 j" relative to the mission clock. */
export function since(iso: string, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000))
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'hier' : `il y a ${days} j`
}

export function toMission(api: ApiMission): Mission {
  const left = api.next_contact_in_s ?? 0
  const h = Math.floor(left / 3600)
  const m = Math.floor((left % 3600) / 60)
  return {
    name: api.name,
    day: api.mission_day,
    clock: api.clock,
    nextContact: `${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')}`,
    latencyMin: Math.round(api.one_way_latency_s / 60),
  }
}

/** Crew member with health data (visible to the viewer) or profile only (score 0). */
export function toCrewMember(
  profile: ApiProfile | ApiCrewSummary,
  summary?: ApiCrewSummary,
  status?: ApiCrewStatus,
): CrewMember {
  const domains = Object.fromEntries(DOMAINS.map((d) => [d, Math.round(status?.domains[d] ?? 0)])) as Record<
    Domain,
    number
  >
  return {
    code: profile.code,
    firstName: profile.first_name,
    lastName: profile.last_name,
    initials: initials(profile.first_name, profile.last_name),
    tone: toneOf(profile.code),
    role: roleLabel(profile.crew_role, profile.is_cmo),
    isCmo: profile.is_cmo,
    score: Math.round(summary?.global_score ?? 0),
    level: summary?.status ?? 'nominal',
    domains,
    topAlert: summary?.top_alert ?? null,
  }
}

export function toAlert(api: ApiAlert, now: Date): Alert {
  return {
    id: api.id,
    level: api.level,
    crew: api.crew_code,
    domain: api.domain === 'global' ? 'cardio' : api.domain,
    domainLabel: api.domain_label ?? undefined,
    title: api.title,
    detail: api.message.replace(/\.$/, ''),
    protocol: api.recommended_protocol,
    since: since(api.triggered_at, now),
    status: api.status,
    assignee: api.acknowledged_by ?? undefined,
  }
}

export function toProtocol(api: ApiProtocol): Protocol {
  return {
    code: api.code,
    version: api.version,
    title: api.title,
    level: api.severity,
    domain: api.domain && api.domain !== 'global' ? api.domain : null,
    minutes: api.expected_duration_min ?? 0,
    summary: api.description?.trim() ?? '',
    exitCriterion: api.exit_criterion ?? '',
    steps: api.steps.map((s) => ({
      code: s.code,
      title: s.title,
      minutes: s.duration_min ?? 0,
      timer: s.timer || undefined,
    })),
    materials: api.materials.map((m) => ({
      name: m.name,
      available: m.available,
      optional: m.optional || undefined,
    })),
  }
}

export function toScenario(api: ApiScenario): Scenario {
  return {
    code: api.code,
    name: api.name,
    description: api.description ?? '',
    expected: api.expected_level ?? 'nominal',
    protocol: api.expected_protocol_code,
  }
}

function factorValue(f: ApiFactor): string {
  const fmt = (v: number | string | null | undefined) =>
    typeof v === 'number' ? number(v, Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0) : (v ?? '—')
  return f.baseline !== undefined && f.baseline !== null
    ? `${fmt(f.value)} · base ${fmt(f.baseline)}`
    : `${fmt(f.value)}`
}

export function toExplanation(api: ApiExplanation): AlertExplanation {
  return {
    factors: api.factors.map((f) => ({
      label: f.label ?? FEATURE_LABELS[f.feature] ?? f.feature,
      value: factorValue(f),
      contribution: f.contribution,
    })),
    rule: api.rule ?? api.rule_code ?? '—',
    anomalyScore: api.anomaly_score ?? 0,
    confirmations: api.confirmations,
  }
}

// ----------------------------------------------------------------- vital signs
interface VitalSpec {
  id: string
  label: string
  digits: number
  min: number
  max: number
}

const VITAL_SPECS: Record<string, VitalSpec> = {
  heart_rate: { id: 'heart_rate', label: 'Fréquence cardiaque', digits: 0, min: 40, max: 140 },
  hrv_rmssd: { id: 'hrv_rmssd', label: 'VFC · RMSSD', digits: 0, min: 15, max: 70 },
  spo2: { id: 'spo2', label: 'SpO₂', digits: 0, min: 88, max: 100 },
  core_temperature: { id: 'temperature', label: 'Température', digits: 1, min: 35.5, max: 38.5 },
}

function trendText(pct: number | null): { trend: string; trendUp: boolean } {
  if (pct === null || Math.abs(pct) < 1) return { trend: 'stable', trendUp: true }
  return { trend: `${pct > 0 ? '+' : '−'}${number(Math.abs(pct))} % vs 36 mesures`, trendUp: pct > 0 }
}

function range(values: number[], spec: VitalSpec, band?: [number, number]) {
  const all = [...values, ...(band ?? [])]
  return {
    min: Math.min(spec.min, ...all),
    max: Math.max(spec.max, ...all),
  }
}

export function toVitals(vitals: Record<string, ApiVitalLatest>, radiation?: ApiRadiation): VitalSnapshot[] {
  const out: VitalSnapshot[] = []
  const add = (metric: string) => {
    const v = vitals[metric]
    const spec = VITAL_SPECS[metric]
    if (!v || !spec || v.value === null) return
    const values = v.points.map((p) => p.value)
    const band: [number, number] | undefined = v.normal_band
      ? [v.normal_band.low, v.normal_band.high]
      : undefined
    out.push({
      id: spec.id,
      label: spec.label,
      value: number(v.value, spec.digits),
      unit: v.unit,
      level: v.level,
      ...trendText(v.trend_pct),
      values,
      band,
      ...range(values, spec, band),
    })
  }
  add('heart_rate')
  add('hrv_rmssd')

  const sys = vitals.systolic_bp
  const dia = vitals.diastolic_bp
  if (sys?.value != null && dia?.value != null) {
    const values = sys.points.map((p) => p.value)
    const worst: Level = [sys.level, dia.level].includes('critical')
      ? 'critical'
      : [sys.level, dia.level].includes('warning')
        ? 'warning'
        : 'nominal'
    out.push({
      id: 'blood_pressure',
      label: 'Pression artérielle',
      value: `${number(sys.value)}/${number(dia.value)}`,
      unit: 'mmHg',
      level: worst,
      ...trendText(sys.trend_pct),
      values,
      band: sys.normal_band ? [sys.normal_band.low, sys.normal_band.high] : undefined,
      min: Math.min(95, ...values),
      max: Math.max(140, ...values),
    })
  }
  add('spo2')
  add('core_temperature')

  if (radiation?.dose_rate_msv_h != null) {
    const values = radiation.history.slice(-36).map((p) => p.dose_rate_msv_h)
    out.push({
      id: 'dose_rate',
      label: 'Débit de dose',
      value: number(radiation.dose_rate_msv_h, 3),
      unit: 'mSv/h',
      level: radiation.dose_rate_msv_h >= 0.104 ? 'critical' : 'nominal',
      trend: `${number(radiation.mission_cumulative_msv)} mSv cumulés`,
      trendUp: false,
      values,
      min: 0,
      max: Math.max(0.15, ...values),
    })
  }
  return out
}

/** Downsample a series to ``count`` evenly spaced values (HRV over 7 days → 84 points). */
export function toSeries(series: ApiVitalSeries, count: number): number[] {
  const values = series.points.map((p) => p.value)
  if (values.length <= count) return values
  const step = values.length / count
  return Array.from({ length: count }, (_, i) => {
    const slice = values.slice(Math.floor(i * step), Math.floor((i + 1) * step))
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}
