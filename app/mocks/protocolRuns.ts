import type { Level } from '~/types/domain'

export type RunProgress = 'in_progress' | 'todo' | 'done'

/** Protocol executions of the signed-in astronaut (backend table protocol_runs). */
export interface ProtocolRunRow {
  code: string
  title: string
  trigger: string
  level: Level
  duration: string
  progress: RunProgress
  /** Re-evaluated efficacy after completion, 0-1 (spec F4.5). */
  efficacy: number | null
}

export const PROTOCOL_RUNS: ProtocolRunRow[] = [
  {
    code: 'PRT-STRESS-01',
    title: 'Respiration guidée & sommeil',
    trigger: 'HRV-01 · VFC basse',
    level: 'warning',
    duration: '9 min',
    progress: 'in_progress',
    efficacy: null,
  },
  {
    code: 'PRT-SANS-01',
    title: 'Test visuel guidé',
    trigger: 'Signal SANS au check-in',
    level: 'warning',
    duration: '15 min',
    progress: 'todo',
    efficacy: null,
  },
  {
    code: 'PRT-EX-03',
    title: 'Rattrapage d’exercice',
    trigger: '2 séances ARED manquées',
    level: 'warning',
    duration: '5 jours',
    progress: 'todo',
    efficacy: null,
  },
  {
    code: 'PRT-RAD-02',
    title: 'Abri radiation (exercice)',
    trigger: 'Exercice d’abri planifié',
    level: 'info',
    duration: '30 min',
    progress: 'done',
    efficacy: 0.82,
  },
  {
    code: 'PRT-STRESS-01',
    title: 'Respiration guidée & sommeil',
    trigger: 'HRV-01 · VFC basse',
    level: 'warning',
    duration: '9 min',
    progress: 'done',
    efficacy: 0.64,
  },
]
