<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/40" @click="onClose" aria-hidden="true"></div>

    <div class="relative bg-white rounded-lg shadow-xl w-[420px] mx-4">
      <!-- Close -->
      <button @click="onClose" class="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
        <Icon icon="mdi:close" width="20" height="20" />
      </button>

      <div class="p-6">
        <h2 class="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>

        <form @submit.prevent="onSubmit" class="mt-5">
          <label class="block text-sm font-medium text-slate-700">Correo Electrónico</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
            class="mt-2 w-full px-4 py-3 border rounded-md bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label class="block text-sm font-medium text-slate-700 mt-4">Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="********"
            required
            class="mt-2 w-full px-4 py-3 border rounded-md bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button type="submit" :disabled="loading" class="mt-6 w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-60">
            <span v-if="!loading">Iniciar Sesión</span>
            <span v-else>Ingresando...</span>
          </button>
        </form>
        <div class="mt-4 text-center">
          <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>
          <a href="#" @click.prevent="onShowRegister" class="text-sm text-blue-600 hover:underline">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { User } from '../../types/user'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  // emitted after successful authentication with the user object (matches backend)
  (e: 'authenticated', user: User): void
  // legacy: emit credentials on submit (keeps backwards compat)
  (e: 'login', payload: { email: string; password: string }): void
  // request parent to show register modal
  (e: 'show-register'): void
}>()

import axios from 'axios'
import { useUserStore } from '../../stores/user'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const userStore = useUserStore()

function onClose() {
  emit('close')
}

async function onSubmit() {
  // legacy event
  emit('login', { email: email.value, password: password.value })

  loading.value = true
  error.value = null
  try {
    // Expecting backend endpoint: POST /api/auth/login -> { user }
    const res = await axios.post('/api/auth/login', { email: email.value, password: password.value })
    const user = res.data?.user ?? res.data
    if (user) {
      userStore.setUser(user)
      emit('authenticated', user)
      emit('close')
    } else {
      error.value = 'Respuesta de servidor inválida'
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Error al autenticar'
  } finally {
    loading.value = false
  }
}

// Reset fields when modal closes
watch(() => props.show, (val) => {
  if (!val) {
    email.value = ''
    password.value = ''
    error.value = null
    loading.value = false
  }
})

function onShowRegister() {
  emit('show-register')
}
</script>

<style scoped>
/* small responsive tweak */
@media (max-width: 480px) {
  .w-\[420px\] {
    width: calc(100% - 2rem);
  }
}
</style>
