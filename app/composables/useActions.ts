/**
 * Write actions of the astronaut and CMO screens (check-in, emergency, protocols, PVT,
 * mission profile). Each one calls the REST API when the backend is reachable and is a
 * no-op in demo mode, so the screens keep working offline for the jury.
 */

export interface ApiEmergency {
  id: number
  patient_code: string | null
  triggered_by_code: string | null
  status: 'active' | 'closed'
  triggered_at: string
  steps: { code: string }[]
  outcome: string | null
}

interface ApiRun {
  id: number
  status: string
  next_step: string | null
}

export function useActions() {
  const { api } = useApi()
  const state = useMissionState()
  const live = () => state.value.source === 'api' && state.value.user !== null

  /** Daily check-in (F3): symptoms 0-3, feelings 0-10. */
  async function submitCheckin(body: Record<string, number | string | null>) {
    if (!live()) return
    await api('/checkins', { method: 'POST', body })
    await loadMissionData()
  }

  /** Emergency mode (F12): the whole crew is alerted, a CRITICAL packet leads the queue. */
  async function triggerEmergency(patientCode?: string) {
    if (!live()) return null
    return api<ApiEmergency>('/emergency', {
      method: 'POST',
      body: patientCode ? { patient_code: patientCode } : {},
    })
  }

  async function activeEmergency(): Promise<ApiEmergency | null> {
    if (!live()) return null
    const active = await api<ApiEmergency[]>('/emergency', { query: { active_only: true } })
    return active[0] ?? null
  }

  async function emergencyStep(id: number, code: string) {
    if (!live()) return
    await api(`/emergency/${id}/steps`, { method: 'POST', query: { code } })
  }

  /** CMO closure (U-04): outcome and summary, then the report goes to the ground queue. */
  async function closeEmergency(id: number, outcome: string, summary: string) {
    if (!live()) return
    await api(`/emergency/${id}/close`, { method: 'POST', body: { outcome, summary } })
    await api('/sync/export', { method: 'POST', body: {} })
    await loadMissionData()
  }

  /** Guided protocol (F4.5): start a run, validate each step in order, then close it. */
  async function startRun(protocolCode: string) {
    if (!live()) return null
    return api<ApiRun>(`/protocols/${protocolCode}/runs`, { method: 'POST', body: {} })
  }

  async function validateStep(runId: number, stepCode: string) {
    if (!live()) return null
    return api<ApiRun>(`/protocols/runs/${runId}`, { method: 'PATCH', body: { step_code: stepCode } })
  }

  async function finishRun(runId: number, efficacy?: number) {
    if (!live()) return
    await api(`/protocols/runs/${runId}`, {
      method: 'PATCH',
      body: { status: 'completed', ...(efficacy === undefined ? {} : { efficacy }) },
    })
    await loadMissionData()
  }

  /** PVT result (F8). */
  async function savePvt(body: {
    stimuli_count: number
    median_rt_ms: number
    lapses: number
    false_starts: number
  }) {
    if (!live()) return
    await api('/pvt', { method: 'POST', body: { duration_seconds: 180, ...body } })
  }

  /** Mission profile (ISS, Moon, Mars): sets the communication delay; CMO only. */
  async function setDestination(destination: string) {
    if (!live()) return false
    if (state.value.user?.access_role !== 'cmo') return false
    await api('/mission', { method: 'PATCH', body: { destination } })
    await loadMissionData()
    return true
  }

  return {
    live,
    submitCheckin,
    triggerEmergency,
    activeEmergency,
    emergencyStep,
    closeEmergency,
    startRun,
    validateStep,
    finishRun,
    savePvt,
    setDestination,
  }
}
