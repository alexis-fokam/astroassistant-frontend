export const TOKEN_COOKIE = 'aa_token'
/** Dernier profil utilisé sur ce poste : présélectionné à l'écran de connexion. */
export const PROFILE_COOKIE = 'aa_profile'
/** Durée de la session : celle du jeton du serveur (AV_TOKEN_TTL_HOURS, 12 h par défaut). */
export const SESSION_SECONDS = 12 * 3600

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | undefined>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// L'inférence des routes typées de $fetch est trop profonde pour une URL externe : simple fonction.
const request = $fetch as unknown as (url: string, options: Record<string, unknown>) => Promise<unknown>

export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>(TOKEN_COOKIE, { sameSite: 'lax', maxAge: SESSION_SECONDS })

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    try {
      return (await request(path, {
        baseURL: config.public.apiBase,
        timeout: 8000,
        ...options,
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      })) as T
    } catch (error: unknown) {
      const response = (error as { response?: { status: number; _data?: { detail?: unknown } } }).response
      if (!response) throw new ApiError(0, 'Serveur Astro Assistant injoignable')
      if (response.status === 401) token.value = null
      const detail = response._data?.detail
      throw new ApiError(response.status, typeof detail === 'string' ? detail : `Erreur ${response.status}`)
    }
  }

  return { api, token }
}
