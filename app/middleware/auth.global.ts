/**
 * Règles d'accès quand le serveur répond (cahier des charges §7) :
 * - les espaces équipage, médecin, sol, notifications exigent une session ;
 * - l'espace médecin est réservé au médecin de bord ;
 * - avec une session ouverte, l'écran de connexion mène directement à son espace.
 * En mode démonstration (serveur injoignable), tout reste ouvert pour le jury.
 */
const PROTECTED = ['/equipage', '/cmo', '/sol', '/urgence', '/notifications']

export default defineNuxtRouteMiddleware((to) => {
  const state = useMissionState()
  if (state.value.source !== 'api') return
  const user = state.value.user
  // Connexion automatique : une session encore valide évite de retaper son PIN.
  if (to.path === '/connexion' && user) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : null
    return navigateTo(redirect ?? (user.access_role === 'cmo' ? '/cmo' : '/equipage'))
  }
  if (!PROTECTED.some((prefix) => to.path.startsWith(prefix))) return

  if (!user) return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  if (to.path.startsWith('/cmo') && user.access_role !== 'cmo') return navigateTo('/equipage')
})
