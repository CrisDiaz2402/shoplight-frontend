<template>
  <div class="w-56 bg-white rounded-lg shadow-lg ring-1 ring-slate-200" role="dialog" aria-label="Perfil del usuario">
    <div class="p-4">
      <div class="text-sm font-medium text-slate-900">{{ user.name }}</div>
      <div class="text-xs text-slate-500 mt-1">{{ user.email }}</div>
    </div>
    <div class="border-t border-slate-100">
      <button v-if="hasUser" @click="emits('purchases')" class="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 border-b border-slate-100">Mis Compras</button>
      <button @click="onLogout" class="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { clearAuth } from '../../lib/api'
import toast from '../../lib/toast'

const props = defineProps<{ user?: { id?: number; name?: string; email?: string; createdAt?: string; updatedAt?: string } }>()
const emits = defineEmits<{
  (e: 'logout'): void
  (e: 'purchases'): void
}>()

const userStore = useUserStore()

// Prefer prop.user when provided; otherwise use the current user from the store.
const user = computed(() => {
  return (
    props.user ?? userStore.currentUser ?? { id: 0, name: 'usuario', email: 'usuario@gmail.com', createdAt: undefined, updatedAt: undefined }
  )
})

// Boolean: true cuando hay un usuario real (prop o store)
const hasUser = computed(() => {
  return !!(props.user ?? userStore.currentUser)
})

function onLogout() {
  // Clear local state and token, then emit logout so parent can react.
  // central helper to clear token from axios defaults and localStorage
  try {
    clearAuth()
  } catch (e) {
    // ignore
  }
  // clear user in store
  try {
    userStore.clearUser()
  } catch (e) {
    // ignore
  }

  // show an informational toast to confirm logout
  try {
    toast.info('Sesión cerrada correctamente')
  } catch (e) {
    // ignore toast errors
  }

  emits('logout')
}
</script>

<style scoped>
/* estilos mínimos, el resto con Tailwind */
</style>
