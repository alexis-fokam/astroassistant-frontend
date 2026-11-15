/**
 * Survol d'un graphique : renvoie l'index du point le plus proche du pointeur (souris ou
 * doigt). Au clavier, une fois le graphique sélectionné, les flèches gauche/droite
 * déplacent l'info-bulle d'un point à l'autre, Origine et Fin vont aux extrémités.
 */
export function useChartHover(count: Ref<number>) {
  const hover = ref<number | null>(null)
  const wrapper = ref<HTMLElement | null>(null)

  function onMove(event: PointerEvent) {
    const el = wrapper.value
    if (!el || count.value < 1) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    hover.value = Math.round(ratio * (count.value - 1))
  }

  function onLeave() {
    hover.value = null
  }

  function onKey(event: KeyboardEvent) {
    const last = count.value - 1
    if (last < 0) return
    const current = hover.value ?? last
    const moves: Record<string, number> = {
      ArrowLeft: Math.max(0, current - 1),
      ArrowRight: Math.min(last, current + 1),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      hover.value = moves[event.key]!
    } else if (event.key === 'Escape') hover.value = null
  }

  return { hover, wrapper, onMove, onLeave, onKey }
}
