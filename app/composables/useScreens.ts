/**
 * Data of the secondary screens (pharmacy, audit, ground link, protocols, systems), loaded
 * from the API with ``useAsyncData`` and converted to the shapes the pages already use.
 * Each loader falls back to the demo mocks when the backend is unreachable or the viewer
 * is not allowed (e.g. the audit trail is CMO-only).
 */
import { AUDIT_LOG, AUDIT_SUMMARY, type AuditEntry } from '~/mocks/audit'
import { GROUND_MESSAGES, type GroundMessage } from '~/mocks/groundMessages'
import { INVENTORY, INVENTORY_SUMMARY, type InventoryRow } from '~/mocks/inventory'
import { PROTOCOL_LIBRARY, type LibraryProtocol } from '~/mocks/protocolLibrary'
import { PROTOCOL_RUNS, type ProtocolRunRow } from '~/mocks/protocolRuns'
import { CONTACT_WINDOWS, SYNC_PACKETS, type SyncPacket as MockSyncPacket } from '~/mocks/syncPackets'

import { SYSTEMS, type SystemDetail } from '~/mocks/systems'
import { ALERTS } from '~/mocks/alerts'
import { VITALS } from '~/mocks/vitals'
import { DOMAIN_KEYS } from '~/constants/domains'
import type {
  ApiAlert,
  ApiAuditEntry,
  ApiContactWindow,
  ApiCrewStatus,
  ApiEmergency,
  ApiSimRun,
  ApiCrewVitals,
  ApiDomainHistory,
  ApiGroundMessage,
  ApiInventoryItem,
  ApiPacket,
  ApiProtocol,
  ApiProtocolSummary,
  ApiRadiation,
  ApiRunListItem,
} from '~/types/api'
import type { Alert, Domain, Level, VitalSnapshot } from '~/types/domain'
import { initials, since, toAlert, toVitals } from '~/utils/apiAdapters'

/** Export packet with its ground reception time (communication delay, ground M4). */
export type SyncPacket = MockSyncPacket & { receivedAt?: string }

type Loaded<T> = { data: T; live: boolean }

/**
 * Run ``load`` against the API when signed in; otherwise (or on error) use ``fallback``.
 * ``key`` may be a getter: the data are reloaded when it changes (e.g. a route param).
 */
async function loadScreen<T>(key: string | (() => string), load: () => Promise<T>, fallback: () => T) {
  const state = useMissionState()
  const { data } = await useAsyncData<Loaded<T>>(key, async () => {
    if (state.value.source !== 'api' || !state.value.user) return { data: fallback(), live: false }
    try {
      return { data: await load(), live: true }
    } catch {
      return { data: fallback(), live: false }
    }
  })
  return computed(() => data.value ?? { data: fallback(), live: false })
}

// ----------------------------------------------------------------- formatting helpers
function missionClock() {
  const clock = useMissionState().value.clock
  const start = clock ? new Date(`${clock.start}T00:00:00Z`) : null
  return (iso: string | null | undefined, withSeconds = false): string => {
    if (!iso) return '—'
    const date = new Date(iso)
    const time = date.toISOString().slice(11, withSeconds ? 19 : 16)
    if (!start) return time
    const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
    return `J+${day} ${time}`
  }
}

const shortHash = (hash: string) => `${hash.slice(0, 4)}…${hash.slice(-4)}`
const kiloBytes = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} Ko`

// ----------------------------------------------------------------- pharmacy (F11)
export async function usePharmacyScreen() {
  // Composables are read before any await: Nuxt loses its context after one.
  const { api } = useApi()
  const state = useMissionState()
  const loaded = await loadScreen(
    'screen-pharmacy',
    async () => {
      const items = await api<ApiInventoryItem[]>('/inventory')
      const missionTime = state.value.clock?.now
      const today = missionTime ? new Date(missionTime) : new Date()
      const rows: InventoryRow[] = items.map((item) => {
        const days = item.expires_on
          ? Math.round((new Date(item.expires_on).getTime() - today.getTime()) / 86_400_000)
          : null
        const expiring = days !== null && days <= 60
        let status: InventoryRow['status'] = { level: 'nominal', label: 'En stock' }
        if (item.quantity <= 0) status = { level: 'critical', label: 'Rupture' }
        else if (item.is_expired) status = { level: 'critical', label: 'Périmé' }
        else if (item.is_low_stock) status = { level: 'warning', label: 'Stock bas' }
        else if (expiring) status = { level: 'warning', label: 'Péremption proche' }
        const location = item.location ?? '—'
        return {
          code: item.code,
          name: item.name,
          quantity: item.quantity,
          capacity: Math.max(item.quantity, item.min_quantity * 3, 1),
          expiry: item.expires_on ? item.expires_on.slice(0, 7) : null,
          expiresInDays: expiring && days !== null ? days : undefined,
          location: location.replace('Module B · tiroir ', 'Module B · T'),
          status,
          group:
            item.is_low_stock || item.quantity <= 0
              ? 'restock'
              : expiring || item.is_expired
                ? 'expiring'
                : 'ok',
          kit: /urgence/i.test(location) ? 'urgence' : /module b/i.test(location) ? 'module-b' : 'other',
        }
      })
      return {
        rows,
        summary: {
          tracked: rows.length,
          lowStock: items.filter((i) => i.is_low_stock).length,
          expiringSoon: rows.filter((r) => r.group === 'expiring').length,
          outOfStock: items.filter((i) => i.quantity <= 0).length,
          inStock: rows.filter((r) => r.group === 'ok').length,
        },
      }
    },
    () => ({ rows: INVENTORY, summary: INVENTORY_SUMMARY }),
  )
  return {
    inventory: computed(() => loaded.value.data.rows),
    summary: computed(() => loaded.value.data.summary),
    live: computed(() => loaded.value.live),
  }
}

// ----------------------------------------------------------------- audit trail (F14)
const ACTION_LEVELS: [RegExp, Level][] = [
  [/^emergency\.|critical/, 'critical'],
  [/^alert\.trigger|auth\.failed|warning/, 'warning'],
]

export async function useAuditScreen() {
  const { api } = useApi()
  const stamp = missionClock()
  const { findCrew } = useMissionData()
  const loaded = await loadScreen(
    'screen-audit',
    async () => {
      const [entries, verdict] = await Promise.all([
        api<ApiAuditEntry[]>('/audit', { query: { limit: 200 } }),
        api<{ valid: boolean; entries: number }>('/audit/verify'),
      ])
      const log: AuditEntry[] = entries.map((e) => {
        const member = findCrew(e.actor_label)
        const detail = [
          e.details?.level,
          e.details?.rule,
          e.details?.crew ?? e.details?.patient,
          e.details?.item,
        ]
          .filter(Boolean)
          .join(' · ')
        const key = `${e.action} ${String(e.details?.level ?? '')}`
        return {
          at: stamp(e.at, true),
          actor: member ? `${member.firstName} ${member.lastName}` : e.actor_label,
          level: ACTION_LEVELS.find(([pattern]) => pattern.test(key))?.[1] ?? 'info',
          action: e.action,
          object:
            [e.entity_type ? `${e.entity_type} #${e.entity_id}` : null, detail].filter(Boolean).join(' · ') ||
            '—',
          hash: shortHash(e.entry_hash),
        }
      })
      return {
        log,
        summary: {
          entries: verdict.entries.toLocaleString('fr-FR'),
          verifiedAt: verdict.valid ? new Date().toISOString().slice(11, 16) : 'chaîne rompue !',
        },
      }
    },
    () => ({ log: AUDIT_LOG, summary: AUDIT_SUMMARY }),
  )
  return {
    auditLog: computed(() => loaded.value.data.log),
    auditSummary: computed(() => loaded.value.data.summary),
    live: computed(() => loaded.value.live),
  }
}

// ----------------------------------------------------------------- ground messages (F10.4)
export async function useGroundMessagesScreen() {
  const { api } = useApi()
  const stamp = missionClock()
  const loaded = await loadScreen(
    'screen-messages',
    async () => {
      const messages = await api<ApiGroundMessage[]>('/sync/messages')
      return messages.map<GroundMessage>((m) => {
        const [name, place] = m.author.split('·').map((part) => part.trim())
        const words = (name ?? m.author).replace(/^Dr\.?\s*/, '').split(/\s+/)
        return {
          id: m.id,
          author: name ?? m.author,
          initials: initials(words[0] ?? '', words.at(-1) ?? ''),
          tone: 1,
          role: place ? `Flight surgeon · ${place}` : 'Contrôle au sol',
          subject: m.subject ?? 'Message du sol',
          receivedAt: stamp(m.received_at),
          sentAt: m.sent_at ? new Date(m.sent_at).toISOString().slice(11, 16) : '—',
          unread: m.read_at === null,
          isInstruction: m.is_instruction,
          body: m.body.split(/\n+/).filter(Boolean),
        }
      })
    },
    () => GROUND_MESSAGES,
  )
  return { messages: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- ground link (F10)
const PACKET_LABELS: Record<string, string> = {
  daily_summary: 'Synthèse quotidienne',
  alert: 'Alerte',
  emergency: 'Urgence',
  event: 'Événement',
  report: 'Rapport',
  timeseries: 'Séries temporelles',
}
const PRIORITY_LEVELS: Level[] = ['critical', 'warning', 'info', 'info']

export async function useSyncScreen() {
  const { api } = useApi()
  const state = useMissionState()
  const stamp = missionClock()
  const loaded = await loadScreen(
    'screen-sync',
    async () => {
      const [packets, windows] = await Promise.all([
        api<ApiPacket[]>('/sync/packets', { query: { queued_only: false, limit: 12 } }),
        api<ApiContactWindow[]>('/sync/windows', { query: { upcoming: 3 } }),
      ])
      const now = new Date(state.value.clock?.now ?? Date.now())
      const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      const hoursOf = (iso: string) => (new Date(iso).getTime() - dayStart) / 3_600_000
      return {
        packets: packets.map<SyncPacket>((p) => ({
          id: p.id,
          content: `${PACKET_LABELS[p.kind] ?? p.kind} ${p.crew_code ?? 'équipage'}`,
          level: PRIORITY_LEVELS[p.priority] ?? 'info',
          sha256: shortHash(p.sha256),
          size: kiloBytes(p.size_bytes),
          createdAt: stamp(p.created_at),
          receivedAt: p.received_at_ground
            ? `${stamp(p.received_at_ground)}${p.in_transit ? ' · en route' : ''}`
            : 'en file à bord',
        })),
        windows: windows.map((w, i) => ({
          from: hoursOf(w.starts_at),
          to: hoursOf(w.ends_at),
          label: `${stamp(w.starts_at)} · ${Math.round(w.one_way_latency_s / 60)} min`,
          state: (i === 0 ? 'next' : 'planned') as 'past' | 'next' | 'planned',
        })),
      }
    },
    () => ({ packets: SYNC_PACKETS, windows: CONTACT_WINDOWS }),
  )
  return {
    packets: computed(() => loaded.value.data.packets as SyncPacket[]),
    contactWindows: computed(() => loaded.value.data.windows),
    live: computed(() => loaded.value.live),
  }
}

// ----------------------------------------------------------------- my protocols (F4)
export async function useProtocolRunsScreen() {
  const { api } = useApi()
  const loaded = await loadScreen(
    'screen-protocol-runs',
    async () => {
      const runs = await api<ApiRunListItem[]>('/protocols/runs', { query: { limit: 30 } })
      return runs.map<ProtocolRunRow>((r) => ({
        code: r.protocol_code,
        title: r.protocol_title,
        trigger: r.trigger ?? 'Lancement manuel',
        level: r.severity,
        duration: r.expected_duration_min ? `${r.expected_duration_min} min` : '—',
        progress: r.status === 'in_progress' ? (r.steps.length ? 'in_progress' : 'todo') : 'done',
        efficacy: r.efficacy,
      }))
    },
    () => PROTOCOL_RUNS,
  )
  return { runs: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- protocol library (F4.1, CMO)
export async function useProtocolLibraryScreen() {
  const { api } = useApi()
  const loaded = await loadScreen(
    'screen-protocol-library',
    async () => {
      const list = await api<ApiProtocolSummary[]>('/protocols')
      const details = await Promise.all(list.map((p) => api<ApiProtocol>(`/protocols/${p.code}`)))
      return details.map<LibraryProtocol>((p) => ({
        code: p.code,
        version: p.version,
        title: p.title,
        level: p.severity,
        updated: `v${p.version}`,
        validatedBy: 'Bibliothèque YAML signée',
        duration: p.expected_duration_min ? `${p.expected_duration_min} min` : '—',
        trigger: {
          rule: (p.trigger?.rules ?? []).join(', ') || '—',
          condition: p.trigger?.summary ?? '—',
        },
        steps: p.steps.map((s) => ({
          title: s.title,
          timing: s.timer ? `${s.duration_min ?? 0} min · minuteur` : `${s.duration_min ?? 0} min`,
        })),
        materials: p.materials.map((m) => ({
          name: m.name,
          status: m.available ? 'available' : m.optional ? 'low' : 'missing',
        })),
        versions: [{ version: `v${p.version}`, note: `Empreinte ${shortHash(p.checksum)}` }],
      }))
    },
    () => PROTOCOL_LIBRARY,
  )
  return { library: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- systems (F1.3-F1.6)
/** Vital charts shown for each domain, by vital id (see toVitals). */
const DOMAIN_CHARTS: Record<Domain, string[]> = {
  cardio: ['heart_rate', 'hrv_rmssd', 'blood_pressure'],
  radiation: ['dose_rate'],
  musculoskeletal: [],
  behavioral: ['hrv_rmssd'],
  immune: ['temperature'],
}

export async function useSystemScreen(domain: Ref<Domain>) {
  const { api } = useApi()
  const state = useMissionState()
  const loaded = await loadScreen(
    () => `screen-system-${domain.value}`,
    async () => {
      const code = state.value.user!.code
      const [history, vitals, radiation] = await Promise.all([
        api<ApiDomainHistory>(`/crew/${code}/domains/${domain.value}`),
        api<ApiCrewVitals>(`/crew/${code}/vitals/latest`),
        api<ApiRadiation>(`/radiation/${code}`, { query: { hours: 96 } }),
      ])
      const live = toVitals(vitals.vitals, radiation)
      const mock = SYSTEMS[domain.value]
      const charts: VitalSnapshot[] = mock.charts.map(
        (chart) => live.find((v) => v.id === chart.id && DOMAIN_CHARTS[domain.value].includes(v.id)) ?? chart,
      )
      const factors = history.factors
        .map(
          (f) =>
            `${f.label ?? f.feature} : ${typeof f.value === 'number' ? f.value.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) : (f.value ?? '—')}`,
        )
        .join(' · ')
      const detail: SystemDetail = {
        ...mock,
        charts,
        summary: factors
          ? `Score ${Math.round(history.score ?? 0)}/100 calculé par le moteur IA. Facteurs principaux : ${factors}.`
          : `Score ${Math.round(history.score ?? 0)}/100 : aucun facteur de risque marqué.`,
      }
      return detail
    },
    () => SYSTEMS[domain.value],
  )
  return { detail: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- dossier astronaute (M-03, CMO)
export interface CrewRecord {
  level: Level
  score: number
  domains: Record<Domain, number>
  factors: string[]
  vitals: VitalSnapshot[]
  alerts: Alert[]
  runs: { id: number; code: string; title: string; status: string; efficacy: number | null }[]
}

/** Clé de rechargement du dossier : la page la rafraîchit pendant la démo en direct. */
export const crewRecordKey = (code: string) => `screen-crew-record-${code}`

/**
 * Dossier d'un astronaute vu par le médecin de bord : statut et scores du moteur IA,
 * dernières mesures, alertes et protocoles. Repli sur les données de démo hors ligne.
 */
export async function useCrewRecordScreen(code: Ref<string>) {
  const { api } = useApi()
  const fallback = (): CrewRecord => {
    const member = useMissionData().findCrew(code.value)
    return {
      level: member?.level ?? 'nominal',
      score: member?.score ?? 0,
      domains: member?.domains ?? ({} as Record<Domain, number>),
      factors: [],
      vitals: VITALS,
      alerts: ALERTS.filter((a) => a.crew === code.value),
      runs: [],
    }
  }
  const loaded = await loadScreen(
    () => crewRecordKey(code.value),
    async () => {
      const [status, vitals, alerts, runs] = await Promise.all([
        api<ApiCrewStatus>(`/crew/${code.value}/status`),
        api<ApiCrewVitals>(`/crew/${code.value}/vitals/latest`),
        api<ApiAlert[]>('/alerts', { query: { crew: code.value, status: 'all', limit: 8 } }),
        api<ApiRunListItem[]>('/protocols/runs', { query: { crew: code.value, status: 'all', limit: 5 } }),
      ])
      const now = new Date(status.timestamp ?? Date.now())
      const domains = Object.fromEntries(
        DOMAIN_KEYS.map((d) => [d, Math.round(status.domains[d] ?? 0)]),
      ) as Record<Domain, number>
      const record: CrewRecord = {
        level: status.status ?? 'nominal',
        score: Math.round(status.global_score ?? 0),
        domains,
        factors: status.top_factors.map(
          (f) =>
            `${f.label ?? f.feature} : ${typeof f.value === 'number' ? f.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : (f.value ?? '—')}`,
        ),
        vitals: toVitals(vitals.vitals),
        alerts: alerts.map((a) => toAlert(a, now)),
        runs: runs.map((r) => ({
          id: r.id,
          code: r.protocol_code,
          title: r.protocol_title,
          status: r.status,
          efficacy: r.efficacy,
        })),
      }
      return record
    },
    fallback,
  )
  return { record: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- notifications
export interface NotificationItem {
  key: string
  kind: 'alert' | 'message' | 'emergency'
  level: Level
  title: string
  detail: string
  /** Date ISO, pour trier du plus récent au plus ancien. */
  at: string
  /** Heure de mission lisible (« J+142 14:05 ») et ancienneté (« il y a 3 min »). */
  stamp: string
  ago: string
  unread: boolean
  to: string
}

/**
 * Centre de notifications : alertes du moteur encore ouvertes, messages du sol et urgences,
 * du plus récent au plus ancien. Repli sur les données de démo hors ligne.
 */
export async function useNotificationsScreen() {
  const { api } = useApi()
  const state = useMissionState()
  const stamp = missionClock()
  const fallback = (): NotificationItem[] => [
    ...ALERTS.filter((a) => a.status !== 'resolved').map<NotificationItem>((a) => ({
      key: `alert-${a.id}`,
      kind: 'alert',
      level: a.level,
      title: a.title,
      detail: `${a.crew} · ${a.detail}`,
      at: '',
      stamp: a.since,
      ago: a.since,
      unread: a.status === 'open',
      to: `/cmo/equipage/${a.crew}`,
    })),
    ...GROUND_MESSAGES.map<NotificationItem>((m) => ({
      key: `message-${m.id}`,
      kind: 'message',
      level: m.isInstruction ? 'warning' : 'info',
      title: m.subject,
      detail: `${m.author} · ${m.role}`,
      at: '',
      stamp: m.receivedAt,
      ago: m.receivedAt,
      unread: m.unread,
      to: m.isInstruction ? '/sol/consignes' : '/equipage/messages',
    })),
  ]
  const loaded = await loadScreen(
    'screen-notifications',
    async () => {
      const [alerts, messages, emergencies] = await Promise.all([
        api<ApiAlert[]>('/alerts', { query: { status: 'active', limit: 100 } }),
        api<ApiGroundMessage[]>('/sync/messages'),
        api<ApiEmergency[]>('/emergency', { query: { active_only: false } }),
      ])
      // « Il y a… » se compte depuis l'heure de mission (la plus récente donnée reçue).
      const latest = [...alerts.map((a) => a.triggered_at), ...messages.map((m) => m.received_at ?? '')]
        .filter(Boolean)
        .sort()
        .at(-1)
      const now = latest ? new Date(latest) : new Date()
      const isCmo = state.value.user?.access_role === 'cmo'
      const items: NotificationItem[] = [
        ...alerts.map<NotificationItem>((a) => ({
          key: `alert-${a.id}`,
          kind: 'alert',
          level: a.level,
          title: a.title,
          detail: `${a.crew_code} · ${a.message.replace(/\.$/, '')}`,
          at: a.triggered_at,
          stamp: stamp(a.triggered_at),
          ago: since(a.triggered_at, now),
          unread: a.status === 'open',
          to: isCmo ? `/cmo/equipage/${a.crew_code}` : '/equipage',
        })),
        ...messages.map<NotificationItem>((m) => ({
          key: `message-${m.id}`,
          kind: 'message',
          level: m.is_instruction ? 'warning' : 'info',
          title: m.subject ?? 'Message du sol',
          detail: m.author,
          at: m.received_at ?? m.sent_at ?? '',
          stamp: stamp(m.received_at),
          ago: m.received_at ? since(m.received_at, now) : '—',
          unread: m.read_at === null,
          to: m.is_instruction ? '/sol/consignes' : '/equipage/messages',
        })),
        ...emergencies.map<NotificationItem>((e) => ({
          key: `emergency-${e.id}`,
          kind: 'emergency',
          level: e.status === 'active' ? 'critical' : 'info',
          title: e.status === 'active' ? 'Urgence en cours' : 'Urgence clôturée',
          detail: [e.patient_code, e.summary ?? e.outcome].filter(Boolean).join(' · '),
          at: e.triggered_at,
          stamp: stamp(e.triggered_at),
          ago: since(e.triggered_at, now),
          unread: e.status === 'active',
          to:
            e.status === 'active'
              ? isCmo
                ? '/cmo/cloture-urgence'
                : '/urgence'
              : isCmo
                ? '/cmo/archives'
                : '/equipage',
        })),
      ]
      return items.sort((a, b) => b.at.localeCompare(a.at))
    },
    fallback,
  )
  return { items: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}

// ----------------------------------------------------------------- archives (médecin de bord)
export interface ArchiveItem {
  key: string
  kind: 'alert' | 'protocol' | 'simulation' | 'emergency'
  level: Level
  title: string
  detail: string
  crew: string | null
  /** Date ISO de début pour trier ; libellés lisibles du début et de la fin. */
  at: string
  start: string
  end: string
  status: string
}

const ARCHIVE_STATUS: Record<string, string> = {
  completed: 'Terminé',
  aborted: 'Interrompu',
  running: 'En cours',
  in_progress: 'En cours',
}

/**
 * Archives du médecin de bord : alertes résolues, protocoles terminés ou interrompus,
 * urgences clôturées et simulations passées. Repli sur les données de démo hors ligne.
 */
export async function useArchivesScreen() {
  const { api } = useApi()
  const stamp = missionClock()
  const fallback = (): ArchiveItem[] => [
    ...ALERTS.filter((a) => a.status === 'resolved').map<ArchiveItem>((a) => ({
      key: `alert-${a.id}`,
      kind: 'alert',
      level: a.level,
      title: a.title,
      detail: a.detail,
      crew: a.crew,
      at: '',
      start: a.since,
      end: '—',
      status: 'Résolue',
    })),
    ...PROTOCOL_RUNS.filter((r) => r.progress === 'done').map<ArchiveItem>((r, i) => ({
      key: `run-${i}`,
      kind: 'protocol',
      level: r.level,
      title: `${r.code} · ${r.title}`,
      detail: r.trigger,
      crew: null,
      at: '',
      start: '—',
      end: '—',
      status: r.efficacy !== null ? `Terminé · efficacité ${Math.round(r.efficacy * 100)} %` : 'Terminé',
    })),
  ]
  const loaded = await loadScreen(
    'screen-archives',
    async () => {
      const [alerts, completed, aborted, sims, emergencies] = await Promise.all([
        api<ApiAlert[]>('/alerts', { query: { status: 'resolved', limit: 200 } }),
        api<ApiRunListItem[]>('/protocols/runs', { query: { status: 'completed', limit: 100 } }),
        api<ApiRunListItem[]>('/protocols/runs', { query: { status: 'aborted', limit: 100 } }),
        api<ApiSimRun[]>('/sim/runs'),
        api<ApiEmergency[]>('/emergency', { query: { active_only: false } }),
      ])
      const items: ArchiveItem[] = [
        ...alerts.map<ArchiveItem>((a) => ({
          key: `alert-${a.id}`,
          kind: 'alert',
          level: a.level,
          title: a.title,
          detail: a.message.replace(/\.$/, ''),
          crew: a.crew_code,
          at: a.triggered_at,
          start: stamp(a.triggered_at),
          end: stamp(a.resolved_at),
          status: a.acknowledged_by ? `Résolue · acquittée par ${a.acknowledged_by}` : 'Résolue',
        })),
        ...[...completed, ...aborted].map<ArchiveItem>((r) => ({
          key: `run-${r.id}`,
          kind: 'protocol',
          level: r.severity,
          title: `${r.protocol_code} · ${r.protocol_title}`,
          detail: r.trigger ?? 'Lancement manuel',
          crew: r.crew_code,
          at: r.started_at ?? '',
          start: stamp(r.started_at),
          end: stamp(r.ended_at),
          status:
            (ARCHIVE_STATUS[r.status] ?? r.status) +
            (r.efficacy !== null ? ` · efficacité ${Math.round(r.efficacy * 100)} %` : ''),
        })),
        ...sims
          .filter((run) => run.status !== 'running')
          .map<ArchiveItem>((run) => ({
            key: `sim-${run.id}`,
            kind: 'simulation',
            level: 'info',
            title: `Scénario ${run.scenario_code}`,
            detail: `×${run.speed_factor} · graine ${run.seed}`,
            crew: run.crew_code,
            at: run.started_at,
            start: stamp(run.started_at),
            end: stamp(run.ended_at),
            status: ARCHIVE_STATUS[run.status] ?? run.status,
          })),
        ...emergencies
          .filter((e) => e.status !== 'active')
          .map<ArchiveItem>((e) => ({
            key: `emergency-${e.id}`,
            kind: 'emergency',
            level: 'critical',
            title: 'Urgence clôturée',
            detail: e.summary ?? e.outcome ?? '—',
            crew: e.patient_code,
            at: e.triggered_at,
            start: stamp(e.triggered_at),
            end: stamp(e.closed_at),
            status: e.outcome ?? 'Clôturée',
          })),
      ]
      return items.sort((a, b) => b.at.localeCompare(a.at))
    },
    fallback,
  )
  return { items: computed(() => loaded.value.data), live: computed(() => loaded.value.live) }
}
