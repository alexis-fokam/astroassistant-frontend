/**
 * Connexion par PIN (cahier des charges §7) : le jeton est gardé dans un cookie pour toute la
 * durée de la session, et le dernier profil est mémorisé pour la prochaine ouverture.
 */
import type { ApiToken } from '~/types/api'

export function useAuth() {
  const { api, token } = useApi()
  const state = useMissionState()
  const lastProfile = useCookie<string | null>(PROFILE_COOKIE, { sameSite: 'lax', maxAge: 30 * 24 * 3600 })

  async function login(code: string, pin: string) {
    const response = await api<ApiToken>('/auth/login', { method: 'POST', body: { code, pin } })
    token.value = response.access_token
    lastProfile.value = code
    await loadMissionData()
    return response.member
  }

  async function logout() {
    token.value = null
    await loadMissionData()
    await navigateTo('/connexion')
  }

  const isLoggedIn = computed(() => Boolean(token.value && state.value.user))
  const isCmo = computed(() => state.value.user?.access_role === 'cmo')
  /** Page d'accueil du profil connecté : le médecin de bord arrive sur son tableau de bord. */
  const home = computed(() => (isCmo.value ? '/cmo' : '/equipage'))

  return { login, logout, isLoggedIn, isCmo, home, lastProfile }
}
