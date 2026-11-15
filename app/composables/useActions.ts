/**
 * Actions d'écriture des écrans équipage et médecin (check-in, urgence, protocoles, PVT,
 * profil de mission, alertes, pharmacie, liaison sol). Chacune appelle l'API quand le serveur
 * répond, et ne fait rien en mode démonstration : les écrans restent utilisables hors ligne.
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

  /** Acquitter (avec un commentaire) ou résoudre une alerte : médecin de bord (F9.2). */
  async function updateAlert(id: number, status: 'acknowledged' | 'resolved', comment?: string) {
    if (!live()) return false
    await api(`/alerts/${id}`, { method: 'PATCH', body: { status, comment: comment || undefined } })
    await loadMissionData()
    return true
  }

  /** Marquer un message du sol comme lu (F10.4). */
  async function markMessageRead(id: number) {
    if (!live()) return false
    await api(`/sync/messages/${id}/read`, { method: 'POST' })
    return true
  }

  /** Construire et mettre en file le paquet de synthèse vers le sol (F10.1). */
  async function exportPacket() {
    if (!live()) return false
    await api('/sync/export', { method: 'POST', body: {} })
    return true
  }

  /** Enregistrer une utilisation en pharmacie, qui décrémente le stock (F11.3, CMO). */
  async function recordUsage(itemCode: string, quantity: number, patientCode?: string, note?: string) {
    if (!live()) return false
    await api('/inventory', {
      method: 'POST',
      body: {
        item_code: itemCode,
        quantity,
        patient_code: patientCode || undefined,
        note: note || undefined,
      },
    })
    return true
  }

  return {
    live,
    updateAlert,
    markMessageRead,
    exportPacket,
    recordUsage,
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
