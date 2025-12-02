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
          <h2 class="text-3xl font-extrabold text-gray-900">Crear Nueva Categoría</h2>
          <p class="mt-1 text-sm text-gray-600">Organiza tus productos creando una nueva categoría</p>
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
      <div class="bg-white py-8 px-6 shadow sm:rounded-lg">
        <form @submit.prevent="handleSubmit" class="space-y-6 w-full">
          <!-- Campo Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nombre de la categoría *
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name }"
                placeholder="Ej: Hogar, Tecnología, Ropa..."
              />
              <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
            </div>
          </div>

          <!-- Campo Descripción -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <div class="mt-1">
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                maxlength="500"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.description }"
                placeholder="Describe brevemente esta categoría..."
              ></textarea>
              <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description }}</p>
              <p class="mt-2 text-sm text-gray-500">{{ formData.description?.length || 0 }}/500 caracteres</p>
            </div>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="generalError" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error al crear categoría</h3>
                <div class="mt-2 text-sm text-red-700">{{ generalError }}</div>
              </div>
            </div>
          </div>

          <!-- Los botones de acción principal ahora están en el header; se elimina el botón "Cancelar" del pie de formulario -->
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCategories } from '../../../composables/categories/useCategories'
import type { CreateCategoryDto } from '../../../types/category'

const router = useRouter()
const { createCategory } = useCategories()

// Estado del formulario
const formData = ref<CreateCategoryDto>({
  name: '',
  description: ''
})

const loading = ref(false)
const generalError = ref('')
const errors = ref<Record<string, string>>({})

// Computed para validar el formulario
const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && !loading.value
})

// Validaciones
function validateForm() {
  errors.value = {}
  
  // Validar nombre
  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'El nombre no puede exceder 100 caracteres'
  }
  
  // Validar descripción
  if (formData.value.description && formData.value.description.length > 500) {
    errors.value.description = 'La descripción no puede exceder 500 caracteres'
  }
  
  return Object.keys(errors.value).length === 0
}

// Manejar envío del formulario
async function handleSubmit() {
  if (!validateForm()) return
  
  loading.value = true
  generalError.value = ''
  
  try {
    const payload: CreateCategoryDto = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined
    }
    
    await createCategory(payload)
    
    // Navegar con query params para mostrar toast en categoryAdmin
    router.push({
      path: '/adminproductos/categorias',
      query: { success: 'created', name: payload.name }
    })
  } catch (error: any) {
    console.error('Error al crear categoría:', error)
    
    if (error?.response?.status === 409 || error?.response?.data?.message?.includes('único')) {
      generalError.value = `Ya existe una categoría con el nombre "${formData.value.name}"`
    } else if (error?.response?.status === 401) {
      generalError.value = 'No tienes permisos para crear categorías'
    } else {
      generalError.value = error?.response?.data?.message || 'Error inesperado al crear la categoría'
    }
  } finally {
    loading.value = false
  }
}

// Ir atrás (volver a la lista de categorías)
function goBack() {
  router.push('/adminproductos/categorias')
}
</script>

<style scoped>
/* Estilos mínimos; el diseño se maneja principalmente con Tailwind */
</style>