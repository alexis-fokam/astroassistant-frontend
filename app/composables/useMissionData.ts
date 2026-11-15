/**
 * Single access point for mission data used by pages.
 *
 * Data come from the FastAPI backend (spec §10) and are loaded once per session by
 * ``loadMissionData`` (plugin ``missionData``) into shared state. When the backend is
 * unreachable, or before login, every field falls back to the demo mocks (~/mocks), so the
 * jury demo never breaks. Pages keep consuming the same shape either way.
 */
import { ALERTS } from '~/mocks/alerts'
import { CREW, CURRENT_CREW_CODE } from '~/mocks/crew'
import { MISSION } from '~/mocks/mission'
import { PROTOCOLS } from '~/mocks/protocols'
import { SCENARIOS } from '~/mocks/scenarios'
import { CURRENT_EXPLANATION, HRV_WEEK, VITALS } from '~/mocks/vitals'
import type {
  ApiAlert,
  ApiCrewStatus,
  ApiCrewSummary,
  ApiCrewVitals,
  ApiExplanation,
  ApiMember,
  ApiMission,
  ApiProfile,
  ApiProtocol,
  ApiProtocolSummary,
  ApiRadiation,
  ApiScenario,
  ApiVitalSeries,
} from '~/types/api'
import type {
  Alert,
  AlertExplanation,
  CrewMember,
  Mission,
  Protocol,
  Scenario,
  VitalSnapshot,
} from '~/types/domain'
import {
  toAlert,
  toCrewMember,
  toExplanation,
  toMission,
  toProtocol,
  toScenario,
  toSeries,
  toVitals,
} from '~/utils/apiAdapters'

export type DataSource = 'api' | 'demo'

export interface MissionDataState {
  source: DataSource
  /** Why the demo data are shown (backend unreachable, not signed in…). */
  reason: string | null
  user: ApiMember | null
  mission: Mission | null
  crew: CrewMember[] | null
  alerts: Alert[] | null
  protocols: Protocol[] | null
  scenarios: Scenario[] | null
  vitals: VitalSnapshot[] | null
  hrvWeek: number[] | null
  currentExplanation: AlertExplanation | null
  /** Mission start date and current mission time (ISO), for J+N stamps. */
  clock: { start: string; now: string } | null
}

const emptyState = (): MissionDataState => ({
  source: 'demo',
  reason: null,
  user: null,
  mission: null,
  crew: null,
  alerts: null,
  protocols: null,
  scenarios: null,
  vitals: null,
  hrvWeek: null,
  currentExplanation: null,
  clock: null,
})

export const useMissionState = () => useState<MissionDataState>('mission-data', emptyState)

/** Load everything the screens need; keeps the demo data for whatever fails. */
export async function loadMissionData(): Promise<void> {
  const state = useMissionState()
  const { api, token } = useApi()
  const next = emptyState()

  try {
    // Public: profiles for the lock screen.
    const profiles = await api<ApiProfile[]>('/profiles')
    next.crew = profiles.map((p) => toCrewMember(p))
    next.source = 'api'
  } catch (error) {
    state.value = { ...next, reason: (error as Error).message }
    return
  }

  if (!token.value) {
    state.value = { ...next, reason: 'Non connecté' }
    return
  }

  try {
    const user = await api<ApiMember>('/auth/me')
    next.user = user
    const [mission, summaries, alerts, scenarios, protocolList] = await Promise.all([
      api<ApiMission>('/mission'),
      api<ApiCrewSummary[]>('/crew'),
      api<ApiAlert[]>('/alerts', { query: { status: 'all', limit: 100 } }),
      api<ApiScenario[]>('/sim/scenarios'),
      api<ApiProtocolSummary[]>('/protocols'),
    ])
    const now = new Date(mission.mission_time)
    next.mission = toMission(mission)
    next.clock = { start: mission.start_date, now: mission.mission_time }

    // Health data only for the members the viewer may see (spec §7); profiles for the rest.
    const statuses = await Promise.all(summaries.map((s) => api<ApiCrewStatus>(`/crew/${s.code}/status`)))
    const byCode = new Map(summaries.map((s, i) => [s.code, { summary: s, status: statuses[i] }]))
    next.crew = next.crew!.map((member) => {
      const visible = byCode.get(member.code)
      return visible ? toCrewMember(visible.summary, visible.summary, visible.status) : member
    })

    next.alerts = alerts
      .filter((a) => a.status !== 'resolved' || a.level !== 'info')
      .map((a) => toAlert(a, now))
    next.scenarios = scenarios.map(toScenario)
    next.protocols = (
      await Promise.all(protocolList.map((p) => api<ApiProtocol>(`/protocols/${p.code}`)))
    ).map(toProtocol)

    const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()
    const [vitals, radiation, hrv] = await Promise.all([
      api<ApiCrewVitals>(`/crew/${user.code}/vitals/latest`),
      api<ApiRadiation>(`/radiation/${user.code}`, { query: { hours: 36 } }),
      api<ApiVitalSeries>(`/vitals/${user.code}`, { query: { type: 'hrv_rmssd', from, limit: 5000 } }),
    ])
    next.vitals = toVitals(vitals.vitals, radiation)
    next.hrvWeek = toSeries(hrv, 84)

    const ownAlert = alerts.find((a) => a.crew_code === user.code && a.status !== 'resolved')
    if (ownAlert) {
      next.currentExplanation = toExplanation(await api<ApiExplanation>(`/alerts/${ownAlert.id}/explanation`))
    }
    state.value = next
  } catch (error) {
    state.value = { ...next, reason: (error as Error).message }
  }
}

export function useMissionData() {
  const state = useMissionState()
  const s = state.value

  const crew = s.crew ?? CREW
  const userCode = s.user?.code ?? CURRENT_CREW_CODE
  const protocols = s.protocols ?? PROTOCOLS
  const findCrew = (code: string): CrewMember | undefined => crew.find((c) => c.code === code)
  const findProtocol = (code: string): Protocol | undefined => protocols.find((p) => p.code === code)

  return {
    /** 'api' when the screens show live backend data, 'demo' otherwise. */
    source: s.source,
    user: s.user,
    mission: s.mission ?? MISSION,
    crew,
    currentCrew: findCrew(userCode) ?? CREW.find((c) => c.code === CURRENT_CREW_CODE)!,
    alerts: s.alerts ?? ALERTS,
    protocols,
    scenarios: s.scenarios ?? SCENARIOS,
    vitals: s.vitals ?? VITALS,
    hrvWeek: s.hrvWeek ?? HRV_WEEK,
    currentExplanation: s.currentExplanation ?? CURRENT_EXPLANATION,
    findCrew,
    findProtocol,
  }
}
