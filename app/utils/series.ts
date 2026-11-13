/** Deterministic PRNG (mulberry32): identical curves on every render, server or client. */
export function seededRandom(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SeriesOptions {
  /** Sine amplitude (circadian rhythm). */
  amp?: number
  /** Sine period, in samples. */
  period?: number
  /** Uniform noise amplitude. */
  noise?: number
  /** Linear drift from first to last sample. */
  drift?: number
  seed?: number
}

/** Builds a synthetic physiological series for charts and previews. */
export function buildSeries(
  length: number,
  base: number,
  { amp = 0, period = 0, noise = 0, drift = 0, seed = 1 }: SeriesOptions = {},
): number[] {
  const random = seededRandom(seed)
  return Array.from({ length }, (_, i) => {
    let value = base + (drift * i) / Math.max(1, length - 1)
    if (period) value += amp * Math.sin((2 * Math.PI * i) / period)
    value += (random() * 2 - 1) * noise
    return Math.round(value * 100) / 100
  })
}
