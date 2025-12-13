<template>
  <div class="w-full">
    <div class="mb-6">
      <div class="mb-3">
        <button
          @click="goBack"
          type="button"
          class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Icon icon="mdi:arrow-left" class="w-5 h-5 mr-2" />
          Volver
        </button>
      </div>

      <div class="flex items-start justify-between">
        <div class="text-left">
          <h2 class="text-3xl font-extrabold text-gray-900">Crear Nuevo Administrador</h2>
          <p class="mt-1 text-sm text-gray-600">Crea una cuenta de administrador para gestionar la aplicación</p>
        </div>

        <div class="flex items-center">
          <button
            @click="handleSubmit"
            type="button"
            :disabled="loading || !isFormValid"
            class="ml-4 inline-flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creando...
            </div>
            <span v-else class="flex items-center">
              <Icon icon="mdi:content-save" class="w-4 h-4 mr-2" />
              Guardar
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="w-full">
      <div class="bg-white py-8 px-6 shadow sm:rounded-lg">
        <form @submit.prevent="handleSubmit" class="space-y-6 w-full">
          <!-- Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
            <div class="mt-1">
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name }"
                placeholder="Ej: María Pérez"
              />
              <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                maxlength="254"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }"
                placeholder="ejemplo@dominio.com"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña *</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password }"
                placeholder="Al menos 6 caracteres"
              />
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
            </div>
          </div>

          <!-- Role (por defecto admin) -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
            <div class="mt-1">
              <select
                id="role"
                v-model="formData.role"
                class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm py-2 px-3"
              >
                <option value="admin">Administrador</option>
                <option value="client">Cliente</option>
              </select>
            </div>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="generalError" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error al crear administrador</h3>
                <div class="mt-2 text-sm text-red-700">{{ generalError }}</div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUsers } from '../../../composables/users/useUsers'

type CreateAdminDto = {
  name: string
  email: string
  password: string
  role?: 'admin' | 'client'
}

const router = useRouter()
const { createUser } = useUsers()

const formData = ref<CreateAdminDto>({ name: '', email: '', password: '', role: 'admin' })
const loading = ref(false)
const generalError = ref('')
const errors = ref<Record<string, string>>({})

const isFormValid = computed(() => {
  const nameOk = !!formData.value.name && formData.value.name.trim().length >= 2
  const emailRaw = (formData.value.email || '').toString().trim()
  const emailOk = emailRaw.length > 0 && /.+@.+\..+/.test(emailRaw)
  const passOk = !!formData.value.password && formData.value.password.length >= 6
  return nameOk && emailOk && passOk && !loading.value
})

function validateForm() {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'El nombre no puede exceder 100 caracteres'
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'El email es obligatorio'
  } else if (!/.+@.+\..+/.test(formData.value.email.trim())) {
    errors.value.email = 'Formato de email inválido'
  }

  if (!formData.value.password) {
    errors.value.password = 'La contraseña es obligatoria'
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  generalError.value = ''

  try {
    const payload: CreateAdminDto = {
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password,
      role: formData.value.role || 'admin'
    }

    const newUser = await createUser(payload)

    // Navegar a la lista de administradores y mostrar toast allí
    router.push({ path: '/adminproductos/usuarios', query: { success: 'created', name: newUser.name } })
  } catch (err: any) {
    console.error('Error al crear administrador:', err)
    // Prisma unique constraint P2002 o mensajes del backend
    const code = err?.response?.data?.code
    const message = err?.response?.data?.message || err?.response?.data?.error

    if (code === 'P2002' || (message && /unique|existe|ya existe/i.test(message))) {
      generalError.value = `Ya existe un usuario con el email "${formData.value.email}"`
    } else if (err?.response?.status === 400) {
      generalError.value = message || 'Datos inválidos'
    } else {
      generalError.value = message || 'Error inesperado al crear el administrador'
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/adminproductos/usuarios')
}
</script>

<style scoped>
/* estilos mínimos; diseño con Tailwind */
</style>
