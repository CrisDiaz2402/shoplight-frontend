<template>
  <div class="w-56 bg-white rounded-lg shadow-lg ring-1 ring-slate-200" role="dialog" aria-label="Perfil del administrador">
    <div class="p-4">
      <div class="text-sm font-medium text-slate-900">{{ user.name }}</div>
      <div class="text-xs text-slate-500 mt-1">{{ user.email }}</div>
      
    </div>
    <div class="border-t border-slate-100">
      <button @click="onLogout" class="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { clearAuth } from '../../lib/api'
import toast from '../../lib/toast'

const props = defineProps<{ user?: { id?: number; name?: string; email?: string; role?: string; createdAt?: string; updatedAt?: string } }>()
const emits = defineEmits<{ (e: 'logout'): void }>()

const userStore = useUserStore()

// Preferir prop.user cuando se pasa; si no usar el currentUser del store
const user = computed(() => {
  return props.user ?? userStore.currentUser ?? { id: 0, name: 'administrador', email: 'admin@shoplight.com', role: 'admin', createdAt: undefined, updatedAt: undefined }
})

function onLogout() {
  try {
    clearAuth()
  } catch (e) {
    // ignore
  }
  try {
    userStore.clearUser()
  } catch (e) {
    // ignore
  }
  try {
    toast.info('Sesión cerrada correctamente')
  } catch (e) {
    // ignore
  }
  emits('logout')
}
</script>

<style scoped>
/* estilos mínimos; el resto con Tailwind */
</style>
