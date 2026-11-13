/**
 * Single access point for mission data used by pages.
 *
 * Today it serves the static mocks in ~/mocks; once the FastAPI endpoints exist
 * (spec §10: /crew, /alerts, /protocols, /sim/scenario...) only this file needs
 * to change — pages keep consuming the same shape.
 */
import { ALERTS } from '~/mocks/alerts'
import { CREW, CURRENT_CREW_CODE } from '~/mocks/crew'
import { MISSION } from '~/mocks/mission'
import { PROTOCOLS } from '~/mocks/protocols'
import { SCENARIOS } from '~/mocks/scenarios'
import { CURRENT_EXPLANATION, HRV_WEEK, VITALS } from '~/mocks/vitals'
import type { CrewMember, Protocol } from '~/types/domain'

export function useMissionData() {
  const findCrew = (code: string): CrewMember | undefined => CREW.find((c) => c.code === code)
  const findProtocol = (code: string): Protocol | undefined => PROTOCOLS.find((p) => p.code === code)

  return {
    mission: MISSION,
    crew: CREW,
    currentCrew: findCrew(CURRENT_CREW_CODE)!,
    alerts: ALERTS,
    protocols: PROTOCOLS,
    scenarios: SCENARIOS,
    vitals: VITALS,
    hrvWeek: HRV_WEEK,
    currentExplanation: CURRENT_EXPLANATION,
    findCrew,
    findProtocol,
  }
}
