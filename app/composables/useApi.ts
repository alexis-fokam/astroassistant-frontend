export const TOKEN_COOKIE = 'aa_token'

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

// $fetch's typed-route inference is too deep for external URLs: use it as a plain function.
const request = $fetch as unknown as (url: string, options: Record<string, unknown>) => Promise<unknown>

export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>(TOKEN_COOKIE, { sameSite: 'lax', maxAge: 12 * 3600 })

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
