<template>
  <div class="w-56 bg-white rounded-lg shadow-lg ring-1 ring-slate-200" role="dialog" aria-label="Perfil del usuario">
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
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{ user: { id?: number; name: string; email: string; createdAt?: string; updatedAt?: string } }>()
const emits = defineEmits<{
  (e: 'logout'): void
}>()

const user = props.user || { id: 0, name: 'usuario', email: 'usuario@gmail.com', createdAt: undefined, updatedAt: undefined }

function onLogout() {
  // Emitimos el evento, sin funcionalidad implementada aún
  emits('logout')
}
</script>

<style scoped>
/* estilos mínimos, el resto con Tailwind */
</style>
