import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const showAuth = ref(false)
  const authMode = ref<'login' | 'register'>('login')

  function openLogin(mode: 'login' | 'register' = 'login') {
    authMode.value = mode
    showAuth.value = true
  }

  function closeLogin() {
    showAuth.value = false
  }

  return { showAuth, authMode, openLogin, closeLogin }
})

export default useUiStore
