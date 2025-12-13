import { ref, computed } from 'vue'
import { api } from '../../lib/api'
import type { User } from '../../types/user'

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role?: 'admin' | 'client'
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
  role?: 'admin' | 'client'
}

export function useUsers() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const q = searchQuery.value.toLowerCase()
    return users.value.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  })

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      // solo administradores: pasamos role=admin
      const response = await api.get('/auth/users', { params: { role: 'admin' } })
      users.value = Array.isArray(response.data) ? response.data : []
      return users.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Error cargando usuarios'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getUser(id: number) {
    try {
      // First try to find in local cache
      const localUser = users.value.find(u => u.id === id)
      if (localUser) {
        return localUser
      }
      
      // If not in cache, fetch all users and find the one we need
      // Since backend doesn't have GET /auth/users/:id endpoint
      await fetchUsers()
      const foundUser = users.value.find(u => u.id === id)
      if (foundUser) {
        return foundUser
      }
      
      // If still not found, throw 404 error
      const error = new Error('Usuario no encontrado')
      ;(error as any).response = { status: 404, data: { message: 'Usuario no encontrado' } }
      throw error
    } catch (err: any) {
      throw err
    }
  }

  async function createUser(payload: CreateUserDto) {
    try {
      // register endpoint
      const response = await api.post('/auth/register', {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })
      // The backend returns { success, message, user } — extract the created user
      const created = response?.data?.user ?? response?.data

      // If role desired and backend requires explicit update, attempt to set role (requires admin auth)
      if (payload.role && payload.role !== 'client' && created && created.id) {
        try {
          const putResp = await api.put(`/auth/users/${created.id}`, { role: payload.role })
          // use updated user if returned
          const updated = putResp?.data?.user ?? putResp?.data
          if (updated) {
            created.role = updated.role ?? payload.role
          } else {
            created.role = payload.role
          }
        } catch (e) {
          // keep original created user if role update fails
          console.warn('No se pudo establecer role tras registro:', e)
        }
      }

      // push a safe representation
      users.value.unshift(created as User)
      return created as User
    } catch (err: any) {
      throw err
    }
  }

  async function updateUser(id: number, payload: UpdateUserDto) {
    try {
      const response = await api.put(`/auth/users/${id}`, payload)
      const updated = response.data as User
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1) users.value[idx] = updated
      return updated
    } catch (err: any) {
      throw err
    }
  }

  async function deleteUser(id: number) {
    try {
      await api.delete(`/auth/users/${id}`)
      users.value = users.value.filter(u => u.id !== id)
      return true
    } catch (err: any) {
      throw err
    }
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q
  }

  function clearError() {
    error.value = null
  }

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    setSearchQuery,
    clearError,
  }
}

export default useUsers
