import axios from 'axios'

// Lee la URL base del backend desde las variables de entorno Vite.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '') as string

/**
 * Retorna la URL base configurada.
 */
export function getApiBase(): string {
  return API_BASE
}

/**
 * Cliente axios preconfigurado para usar la URL base del backend.
 * No realiza llamadas automáticas: es sólo una utilidad para que el frontend
 * centralice la configuración de requests.
 */
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: asegurar que si hay un token en localStorage se adjunte
api.interceptors.request.use((config) => {
  try {
    const t = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (t) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${t}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

/**
 * Establece o elimina el header Authorization en el cliente `api`.
 * Útil para inyectar el JWT después del login.
 */
export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Storage key used for persisting the token locally.
export const TOKEN_STORAGE_KEY = 'shoplight_token'
// key to persist the user object locally for session restore
export const USER_STORAGE_KEY = 'shoplight_user'

// Try to read existing token from localStorage on module load and set header
// This ensures that after a page reload the `api` client has the Authorization header.
try {
  const existing = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (existing) setAuthToken(existing)
} catch (e) {
  // ignore if storage not available (SSR or privacy settings)
}

/**
 * Clear auth info: remove token from axios default headers and localStorage.
 */
export function clearAuth() {
  try {
    setAuthToken(null)
  } catch (e) {
    // ignore
  }
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch (e) {
    // ignore
  }
  try {
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch (e) {
    // ignore
  }
}

export default { getApiBase, api, setAuthToken }
