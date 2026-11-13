import type { Domain, VitalSnapshot } from '~/types/domain'
import { buildSeries } from '~/utils/series'

export interface ThresholdRow {
  parameter: string
  nominal: string
  warning: string
  critical: string
}

export interface SystemDetail {
  summary: string
  charts: VitalSnapshot[]
  thresholds?: ThresholdRow[]
}

const HOURS = 96

/** Per-domain detail of the signed-in astronaut (spec F1.3 to F1.6). */
export const SYSTEMS: Record<Domain, SystemDetail> = {
  cardio: {
    summary: 'VFC à 65 % de la baseline individuelle (48 ms, 1 240 échantillons). Pente −2,3 ms par jour.',
    charts: [
      {
        id: 'heart_rate',
        label: 'Fréquence cardiaque',
        value: '72',
        unit: 'bpm',
        level: 'nominal',
        trend: 'Moy. 7 j 70 · max 112 (effort)',
        trendUp: true,
        values: buildSeries(HOURS, 68, { amp: 9, period: 48, noise: 3, seed: 21 }),
        band: [50, 90],
        min: 40,
        max: 120,
      },
      {
        id: 'hrv_rmssd',
        label: 'VFC · RMSSD',
        value: '31',
        unit: 'ms',
        level: 'warning',
        trend: 'Baseline 48 ± 6 ms',
        trendUp: false,
        values: buildSeries(HOURS, 49, { noise: 3.5, drift: -17, seed: 22 }),
        band: [38.4, 62],
        min: 20,
        max: 65,
      },
      {
        id: 'blood_pressure',
        label: 'Pression systolique',
        value: '118/76',
        unit: 'mmHg',
        level: 'nominal',
        trend: 'Orthostatique +6 bpm debout',
        trendUp: false,
        values: buildSeries(HOURS, 118, { amp: 6, period: 48, noise: 3, seed: 23 }),
        band: [90, 135],
        min: 80,
        max: 170,
      },
      {
        id: 'spo2',
        label: 'Saturation SpO₂',
        value: '98',
        unit: '%',
        level: 'nominal',
        trend: 'CO₂ cabine 0,42 %',
        trendUp: true,
        values: buildSeries(HOURS, 97.6, { amp: 0.5, period: 48, noise: 0.5, seed: 24 }),
        band: [95, 100],
        min: 88,
        max: 100,
      },
    ],
    thresholds: [
      { parameter: 'FC au repos', nominal: '50-90 bpm', warning: '< 45 ou 90-110', critical: '< 40 ou > 120' },
      { parameter: 'SpO₂', nominal: '≥ 95 %', warning: '91-94 %', critical: '≤ 90 %' },
      { parameter: 'PA systolique', nominal: '90-135 mmHg', warning: '136-159', critical: '≥ 160 ou < 85' },
      { parameter: 'Température', nominal: '36,1-37,4 °C', warning: '37,5-38,4', critical: '≥ 38,5' },
      { parameter: 'VFC (RMSSD)', nominal: '≥ 80 % base', warning: '60-80 % base', critical: '< 60 % base' },
    ],
  },
  radiation: {
    summary: 'Dose de mission 86,4 mSv, soit 31 % de la limite de carrière. Débit de fond stable.',
    charts: [
      {
        id: 'dose_cumulative',
        label: 'Dose cumulée mission',
        value: '86,4',
        unit: 'mSv',
        level: 'nominal',
        trend: 'Projection fin de mission 142 mSv',
        trendUp: true,
        values: Array.from({ length: 60 }, (_, i) => 60 + i * 0.45),
        min: 50,
        max: 100,
      },
      {
        id: 'dose_rate',
        label: 'Débit de dose',
        value: '0,021',
        unit: 'mSv/h',
        level: 'nominal',
        trend: 'Fond cosmique galactique',
        trendUp: false,
        values: buildSeries(HOURS, 0.021, { noise: 0.003, seed: 25 }),
        min: 0,
        max: 0.05,
      },
    ],
  },
  musculoskeletal: {
    summary: '142 jours en microgravité. Adhérence aux exercices en baisse depuis 5 jours.',
    charts: [
      {
        id: 'bone_density',
        label: 'Densité osseuse estimée',
        value: '−5,7',
        unit: '% depuis J+0',
        level: 'nominal',
        trend: '−1,2 % par mois',
        trendUp: false,
        values: Array.from({ length: 48 }, (_, i) => -(1.2 * i * 3) / 30),
        min: -9,
        max: 0.5,
      },
      {
        id: 'muscle_mass',
        label: 'Masse musculaire estimée',
        value: '−1,9',
        unit: '%',
        level: 'nominal',
        trend: '−0,4 % par mois',
        trendUp: false,
        values: Array.from({ length: 48 }, (_, i) => -(0.4 * i * 3) / 30),
        min: -4,
        max: 0.5,
      },
    ],
  },
  behavioral: {
    summary: 'Stress en hausse sur 7 jours, humeur en baisse, vigilance PVT dégradée de 16 %.',
    charts: [
      {
        id: 'stress',
        label: 'Score de stress',
        value: '7',
        unit: '/ 10',
        level: 'warning',
        trend: 'Baseline 3,4',
        trendUp: true,
        values: buildSeries(84, 3, { noise: 0.8, drift: 4, seed: 26 }),
        band: [0, 5],
        min: 0,
        max: 10,
      },
      {
        id: 'sleep',
        label: 'Durée de sommeil',
        value: '5 h 40',
        unit: '',
        level: 'warning',
        trend: 'Dette cumulée 5,5 h',
        trendUp: false,
        values: [7.2, 6.9, 7.4, 6.5, 7, 6.8, 7.1, 6.2, 6.6, 5.9, 6.1, 5.4, 5.6, 5.7],
        band: [7, 9],
        min: 4,
        max: 9,
      },
    ],
  },
  immune: {
    summary: 'Aucun symptôme infectieux déclaré, température stable, environnement cabine conforme.',
    charts: [
      {
        id: 'temperature',
        label: 'Température corporelle',
        value: '36,8',
        unit: '°C',
        level: 'nominal',
        trend: 'Amplitude circadienne 0,4 °C',
        trendUp: true,
        values: buildSeries(HOURS, 36.75, { amp: 0.2, period: 12, noise: 0.08, seed: 27 }),
        band: [36.1, 37.4],
        min: 36,
        max: 38.6,
      },
      {
        id: 'cabin_co2',
        label: 'CO₂ cabine',
        value: '0,42',
        unit: '%',
        level: 'nominal',
        trend: 'Seuil 0,53 %',
        trendUp: false,
        values: buildSeries(HOURS, 0.4, { amp: 0.06, period: 30, noise: 0.02, seed: 28 }),
        band: [0, 0.53],
        min: 0.2,
        max: 0.6,
      },
    ],
  },
}
