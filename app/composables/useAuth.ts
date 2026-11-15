/** PIN login against the backend (spec §7): token in a cookie, data reloaded after login. */
import type { ApiToken } from '~/types/api'

export function useAuth() {
  const { api, token } = useApi()
  const state = useMissionState()

  async function login(code: string, pin: string) {
    const response = await api<ApiToken>('/auth/login', { method: 'POST', body: { code, pin } })
    token.value = response.access_token
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

  return { login, logout, isLoggedIn, isCmo }
}
