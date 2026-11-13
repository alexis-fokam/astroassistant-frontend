import type { Component } from 'vue'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-vue-next'
import type { Level } from '~/types/domain'

/**
 * Visual vocabulary of each status. A status is always rendered with
 * colour + icon + label, never colour alone (spec §11, colour-blind safe).
 */
export interface LevelStyle {
  label: string
  icon: Component
  /** Filled pill (table cell, banner). */
  solid: string
  /** Tinted badge on a white card. */
  soft: string
  /** Text or icon colour on white, WCAG AA. */
  ink: string
  /** Bar or stripe fill. */
  bar: string
}

export const LEVEL_STYLES: Record<Level, LevelStyle> = {
  nominal: {
    label: 'NOMINAL',
    icon: CircleCheck,
    solid: 'bg-nominal text-ink',
    soft: 'bg-nominal-soft text-nominal-ink',
    ink: 'text-nominal-ink',
    bar: 'bg-nominal',
  },
  warning: {
    label: 'WARNING',
    icon: TriangleAlert,
    solid: 'bg-warning text-ink',
    soft: 'bg-warning-soft text-warning-ink',
    ink: 'text-warning-ink',
    bar: 'bg-warning',
  },
  critical: {
    label: 'CRITICAL',
    icon: OctagonAlert,
    solid: 'bg-critical text-white',
    soft: 'bg-critical-soft text-critical-ink',
    ink: 'text-critical-ink',
    bar: 'bg-critical',
  },
  info: {
    label: 'INFO',
    icon: Info,
    solid: 'bg-info text-white',
    soft: 'bg-info-soft text-info-ink',
    ink: 'text-info-ink',
    bar: 'bg-info',
  },
}

/** Raw colours for SVG charts (kept in sync with the theme tokens in main.css). */
export const LEVEL_HEX: Record<Level, string> = {
  nominal: '#00c875',
  warning: '#fdab3d',
  critical: '#d0304a',
  info: '#1f6fdb',
}
