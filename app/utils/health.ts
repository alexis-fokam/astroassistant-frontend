import type { Level } from '~/types/domain'

/** Maps a 0-100 risk score to its level (spec §6.3: 0-39 | 40-69 | 70-100). */
export function levelFromScore(score: number): Level {
  if (score >= 70) return 'critical'
  if (score >= 40) return 'warning'
  return 'nominal'
}
