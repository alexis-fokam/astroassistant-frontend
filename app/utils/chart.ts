/** Aides partagées des graphiques : format des valeurs et libellés de l'axe horizontal. */

/** Valeur au format français, avec son unité : « 1 234,5 bpm ». */
export function formatChartValue(value: number, digits = 1, unit?: string): string {
  const text = value.toLocaleString('fr-FR', { maximumFractionDigits: digits })
  return unit ? `${text} ${unit}` : text
}

/**
 * Libellé du point `index` : celui fourni par la page, sinon sa position
 * (« Point 3 sur 24 »), pour qu'une info-bulle ait toujours un repère.
 */
export function chartXLabel(
  labels: string[] | ((index: number) => string) | undefined,
  index: number,
  count: number,
  t: (text: string, params?: Record<string, string | number>) => string,
): string {
  if (typeof labels === 'function') return labels(index)
  if (labels?.[index]) return labels[index]!
  return t('Point {n} sur {total}', { n: index + 1, total: count })
}

type Translate = (text: string, params?: Record<string, string | number>) => string
// Sans traducteur, on remplace seulement les paramètres (texte français).
const plain: Translate = (text, params) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(params?.[key] ?? `{${key}}`))

/** Libellés « il y a N h » pour une série horaire qui se termine maintenant. */
export function hoursAgoLabels(count: number, stepHours = 1, t: Translate = plain) {
  return (index: number) => {
    const hours = Math.round((count - 1 - index) * stepHours)
    if (hours === 0) return t('Maintenant')
    if (hours < 24) return t('Il y a {n} h', { n: hours })
    const days = Math.floor(hours / 24)
    const rest = hours % 24
    return rest ? t('Il y a {d} j {h} h', { d: days, h: rest }) : t('Il y a {d} j', { d: days })
  }
}

/** Libellés « J-6 … Aujourd'hui » pour une série quotidienne qui se termine aujourd'hui. */
export function daysAgoLabels(count: number, t: Translate = plain) {
  return (index: number) => {
    const days = count - 1 - index
    return days === 0 ? t('Aujourd’hui') : `J-${days}`
  }
}
