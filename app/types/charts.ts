/** Entrées des graphiques SVG (components/charts). */

export interface ChartSeries {
  values: number[]
  color: string
  /** Nom affiché dans l'info-bulle (« Projection actuelle »…). */
  name?: string
  /** Draw as a dashed line (projections). */
  dashed?: boolean
  /** Index of the first value on the shared x axis. */
  offset?: number
}

/** Horizontal value band shaded behind the curves. */
export interface ChartZone {
  from: number
  to: number
  color: string
  opacity?: number
}

/** Vertical dashed marker at a given x index (e.g. a planned EVA). */
export interface ChartMarker {
  index: number
  color: string
}
