<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/40" @click="onClose" aria-hidden="true"></div>

    <div class="relative bg-white rounded-lg shadow-xl w-[420px] mx-4">
      <!-- Close -->
      <button @click="onClose" class="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
        <Icon icon="mdi:close" width="20" height="20" />
      </button>

      <div class="p-6">
        <h2 class="text-2xl font-bold text-slate-900">Crear Cuenta</h2>

        <form @submit.prevent="onSubmit" class="mt-5">
          <label class="block text-sm font-medium text-slate-700">Nombre</label>
          <input
            v-model="name"
            type="text"
            placeholder="Tu nombre"
            required
            class="mt-2 w-full px-4 py-3 border rounded-md bg-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label class="block text-sm font-medium text-slate-700 mt-4">Correo Electrónico</label>
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

          <button type="submit" class="mt-6 w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700">
            Crear Cuenta
          </button>
        </form>

        <div class="mt-4 text-center">
          <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>
          <a href="#" @click.prevent="onShowLogin" class="text-sm text-blue-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</a>
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
  // emitted after successful registration with the user object (matches backend)
  (e: 'registered', user: User): void
  // legacy: emit credentials on submit (keeps backwards compat)
  (e: 'register', payload: { name: string; email: string; password: string }): void
  // request parent to show login modal
  (e: 'show-login'): void
}>()

import { api } from '../../lib/api'
import toast from '../../lib/toast'
// userStore is not needed during registration because we don't auto-login
// import { useUserStore } from '../../stores/user'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// const userStore = useUserStore()

function onClose() {
  emit('close')
}

async function onSubmit() {
  // legacy event
  emit('register', { name: name.value, email: email.value, password: password.value })

  loading.value = true
  error.value = null
  try {
    // Call backend register endpoint. Expecting 201 with created user object.
    const res = await api.post('/auth/register', { name: name.value, email: email.value, password: password.value })
    const user = res.data?.user ?? res.data
    if (user && user.id) {
      // Do NOT set the user in the store and do NOT persist token here.
      // After successful registration, request the UI to show the login modal so the user can authenticate.
      // Show a success toast with the backend message (if any)
      try {
        const msg = res.data?.message || 'Usuario registrado correctamente'
        toast.success(msg)
      } catch (e) {
        // ignore toast errors
      }
      emit('registered', user)
      // Ask parent (authModal) to switch to login view
      emit('show-login')
    } else {
      error.value = 'Respuesta de servidor inválida'
    }
  } catch (err: any) {
    // Prefer backend 'error' field when present (e.g. { error: 'El email ya está registrado' })
    error.value = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error al registrar'
  } finally {
    loading.value = false
  }
}

// Reset fields when modal closes
watch(() => props.show, (val) => {
  if (!val) {
    name.value = ''
    email.value = ''
    password.value = ''
    error.value = null
    loading.value = false
  }
})

function onShowLogin() {
  emit('show-login')
}
</script>

<style scoped>
@media (max-width: 480px) {
  .w-\[420px\] {
    width: calc(100% - 2rem);
  }
}
</style>
