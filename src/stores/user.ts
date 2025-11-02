import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserModel {
  id: number
  email: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserModel | null>(null)

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
