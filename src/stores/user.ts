import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { USER_STORAGE_KEY } from '../lib/api'

export interface UserModel {
  id: number
  email: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserModel | null>(null)

  // Try to restore persisted user from localStorage so session survives reloads.
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // basic validation
      if (parsed && parsed.id) {
        currentUser.value = parsed as UserModel
      }
    }
  } catch (e) {
    // ignore parse/storage errors
  }

  function setUser(user: UserModel) {
    currentUser.value = user
  }

  function clearUser() {
    currentUser.value = null
  }

  const isAuthenticated = computed(() => currentUser.value !== null)

  return {
    currentUser,
    setUser,
    clearUser,
    isAuthenticated,
  }
})
