/**
 * Access rules when the backend is available (spec §7):
 * - the astronaut and CMO spaces require a session (redirect to the lock screen);
 * - the CMO space is reserved to the crew medical officer.
 * In demo mode (backend unreachable) every screen stays open for the jury.
 */
const PROTECTED = ['/equipage', '/cmo', '/sol', '/urgence']

export default defineNuxtRouteMiddleware((to) => {
  const state = useMissionState()
  if (state.value.source !== 'api') return
  if (!PROTECTED.some((prefix) => to.path.startsWith(prefix))) return

  const user = state.value.user
  if (!user) return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  if (to.path.startsWith('/cmo') && user.access_role !== 'cmo') return navigateTo('/equipage')
})
