import type { AlertExplanation, VitalSnapshot } from '~/types/domain'
import { buildSeries } from '~/utils/series'

/** Current vital signs of the signed-in astronaut (scenario S2: stress and sleep debt). */
export const VITALS: VitalSnapshot[] = [
  {
    id: 'heart_rate',
    label: 'Fréquence cardiaque',
    value: '72',
    unit: 'bpm',
    level: 'nominal',
    trend: '+3 % vs 7 j',
    trendUp: true,
    values: buildSeries(36, 70, { amp: 6, period: 18, noise: 3, seed: 2 }),
    band: [55, 85],
    min: 50,
    max: 95,
  },
  {
    id: 'hrv_rmssd',
    label: 'VFC · RMSSD',
    value: '31',
    unit: 'ms',
    level: 'warning',
    trend: '−35 % vs baseline',
    trendUp: false,
    values: buildSeries(36, 47, { noise: 2.5, drift: -16, seed: 3 }),
    band: [38, 58],
    min: 20,
    max: 60,
  },
  {
    id: 'blood_pressure',
    label: 'Pression artérielle',
    value: '118/76',
    unit: 'mmHg',
    level: 'nominal',
    trend: '−1 % vs 7 j',
    trendUp: false,
    values: buildSeries(36, 118, { noise: 3, seed: 4 }),
    band: [100, 135],
    min: 95,
    max: 140,
  },
  {
    id: 'spo2',
    label: 'SpO₂',
    value: '98',
    unit: '%',
    level: 'nominal',
    trend: 'stable',
    trendUp: true,
    values: buildSeries(36, 97.8, { noise: 0.4, seed: 5 }),
    band: [95, 100],
    min: 93,
    max: 100,
  },
  {
    id: 'temperature',
    label: 'Température',
    value: '36,8',
    unit: '°C',
    level: 'nominal',
    trend: '+0,1 °C',
    trendUp: true,
    values: buildSeries(36, 36.7, { amp: 0.15, period: 36, noise: 0.08, seed: 6 }),
    band: [36.1, 37.4],
    min: 36,
    max: 37.8,
  },
  {
    id: 'dose_rate',
    label: 'Débit de dose',
    value: '0,021',
    unit: 'mSv/h',
    level: 'nominal',
    trend: 'fond cosmique',
    trendUp: false,
    values: buildSeries(36, 0.021, { noise: 0.002, seed: 8 }),
    min: 0,
    max: 0.05,
  },
]

/** HRV over 7 days (84 samples, two per hour), with individual baseline 48 ms. */
export const HRV_WEEK = buildSeries(84, 49, { noise: 3.5, drift: -17, seed: 11 })

/** Explanation of the active WARNING (spec F2.7). */
export const CURRENT_EXPLANATION: AlertExplanation = {
  factors: [
    { label: 'VFC RMSSD', value: '31 ms · base 48', contribution: 0.42 },
    { label: 'Dette de sommeil', value: '5,5 h', contribution: 0.31 },
    { label: 'Stress déclaré', value: '7 / 10', contribution: 0.14 },
  ],
  rule: 'hrv < 0.8 × baseline ∧ sommeil < 6 h × 3 nuits',
  anomalyScore: 0.71,
  confirmations: 2,
}
