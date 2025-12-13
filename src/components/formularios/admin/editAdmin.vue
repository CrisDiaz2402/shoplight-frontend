<template>
  <div class="w-full">
    <div class="mb-6">
      <div class="mb-3">
        <button @click="goBack" type="button" class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800">
          <Icon icon="mdi:arrow-left" class="w-5 h-5 mr-2" />
          Volver
        </button>
      </div>

      <div class="flex items-start justify-between">
        <div class="text-left">
          <h2 class="text-3xl font-extrabold text-gray-900">Editar Administrador</h2>
          <p class="mt-1 text-sm text-gray-600">Actualiza los datos del administrador</p>
        </div>

        <div class="flex items-center">
          <button
            @click="handleSave"
            type="button"
            :disabled="loading || !isFormValid"
            class="ml-4 inline-flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
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
      <div v-if="loadingCategory" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-2 text-slate-600">Cargando usuario...</span>
      </div>

      <div v-else-if="generalError && !formData.name" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error al cargar usuario</h3>
            <div class="mt-2 text-sm text-red-700">{{ generalError }}</div>
            <button @click="goBack" class="mt-3 text-red-800 underline hover:no-underline">Volver a la lista</button>
          </div>
        </div>
      </div>

      <div v-else class="bg-white py-8 px-6 shadow sm:rounded-lg">
        <form @submit.prevent="handleSave" class="space-y-6 w-full">
          <!-- Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
            <div class="mt-1">
              <input id="name" v-model="formData.name" type="text" required maxlength="100"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name }" placeholder="Ej: María Pérez" />
              <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <div class="mt-1">
              <input id="email" v-model="formData.email" type="email" required maxlength="254"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email }" placeholder="ejemplo@dominio.com" />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
            </div>
          </div>

          <!-- Password (opcional) -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña (dejar vacío para no cambiar)</label>
            <div class="mt-1">
              <input id="password" v-model="formData.password" type="password" minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password }" placeholder="Al menos 6 caracteres" />
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
            </div>
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Rol</label>
            <div class="mt-1">
              <select id="role" v-model="formData.role" class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm py-2 px-3">
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
                <h3 class="text-sm font-medium text-red-800">Error al actualizar usuario</h3>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUsers } from '../../../composables/users/useUsers'
import toast from '../../../lib/toast'

interface Props { id?: string }
const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const { getUser, updateUser } = useUsers()

const formData = ref<{ name: string; email: string; password?: string; role?: 'admin' | 'client' }>({ name: '', email: '', password: undefined, role: 'admin' })
const loading = ref(false)
const loadingCategory = ref(false)
const generalError = ref('')
const errors = ref<Record<string, string>>({})
const userId = ref<number | null>(null)

const isFormValid = computed(() => {
  const nameOk = !!formData.value.name && formData.value.name.trim().length >= 2
  const emailRaw = (formData.value.email || '').toString().trim()
  const emailOk = emailRaw.length > 0 && /.+@.+\..+/.test(emailRaw)
  const passOk = !formData.value.password || (formData.value.password.length >= 6)
  return nameOk && emailOk && passOk && !loading.value
})

onMounted(async () => { await loadUser() })

async function loadUser() {
  const id = props.id || (route.params.id as string)
  if (!id) {
    generalError.value = 'ID de usuario no válido'
    return
  }

  loadingCategory.value = true
  generalError.value = ''

  try {
    userId.value = Number(id)
    const user = await getUser(userId.value)
    formData.value = { name: user.name || '', email: user.email || '', role: (user.role as 'admin'|'client') || 'client' }
  } catch (err: any) {
    console.error('Error al cargar usuario:', err)
    if (err?.response?.status === 404) generalError.value = 'Usuario no encontrado'
    else generalError.value = err?.response?.data?.message || 'Error al cargar usuario'
  } finally {
    loadingCategory.value = false
  }
}

function validateForm() {
  errors.value = {}
  if (!formData.value.name.trim()) errors.value.name = 'El nombre es obligatorio'
  else if (formData.value.name.trim().length < 2) errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  if (!formData.value.email.trim()) errors.value.email = 'El email es obligatorio'
  else if (!/.+@.+\..+/.test(formData.value.email.trim())) errors.value.email = 'Formato de email inválido'
  if (formData.value.password && formData.value.password.length < 6) errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  return Object.keys(errors.value).length === 0
}

async function handleSave() {
  if (!validateForm()) return
  if (!userId.value) return

  loading.value = true
  generalError.value = ''

  try {
    const payload: any = { name: formData.value.name.trim(), email: formData.value.email.trim(), role: formData.value.role }
    if (formData.value.password) payload.password = formData.value.password

    const updated = await updateUser(userId.value, payload)
    router.push({ path: '/adminproductos/usuarios', query: { success: 'updated', name: updated.name } })
  } catch (err: any) {
    console.error('Error al actualizar usuario:', err)
    const message = err?.response?.data?.message || err?.response?.data?.error
    if (err?.response?.status === 404) generalError.value = 'Usuario no encontrado'
    else generalError.value = message || 'Error al actualizar usuario'
    toast.error('Error al actualizar usuario', { autoClose: 2000 })
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/adminproductos/usuarios') }
</script>

<style scoped>
/* estilos mínimos; diseño con Tailwind */
</style>
