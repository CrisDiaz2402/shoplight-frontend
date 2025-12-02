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
          <h2 class="text-3xl font-extrabold text-gray-900">Editar Detalles de Categoría</h2>
          <p class="mt-1 text-sm text-gray-600">Modifica el nombre o la descripción de la categoría</p>
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
      <!-- Loading inicial mientras se carga la categoría -->
      <div v-if="loadingCategory" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-2 text-slate-600">Cargando categoría...</span>
      </div>

      <!-- Error de carga inicial -->
      <div v-else-if="generalError && !formData.name" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error al cargar categoría</h3>
            <div class="mt-2 text-sm text-red-700">{{ generalError }}</div>
            <button @click="goBack" class="mt-3 text-red-800 underline hover:no-underline">
              Volver a la lista
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario (solo visible cuando se ha cargado la categoría) -->
      <div v-else class="bg-white py-8 px-6 shadow sm:rounded-lg">
        <!-- Diseño igual al del formulario de creación; la lógica (fetch/update) se implementará aparte -->
        <form @submit.prevent="handleSave" class="space-y-6 w-full">
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
                <h3 class="text-sm font-medium text-red-800">Error al editar categoría</h3>
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
import { useCategories } from '../../../composables/categories/useCategories'
import type { CreateCategoryDto } from '../../../types/category'
import toast from '../../../lib/toast'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const { getCategory, updateCategory } = useCategories()

const formData = ref<CreateCategoryDto>({ name: '', description: '' })
const loading = ref(false)
const loadingCategory = ref(false)
const generalError = ref('')
const errors = ref<Record<string, string>>({})
const categoryId = ref<number>(0)

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && !loading.value
})

// Cargar categoría al montar el componente
onMounted(async () => {
  await loadCategory()
})

async function loadCategory() {
  const id = props.id || route.params.id as string
  if (!id) {
    generalError.value = 'ID de categoría no válido'
    return
  }

  loadingCategory.value = true
  generalError.value = ''
  
  try {
    categoryId.value = Number(id)
    const category = await getCategory(categoryId.value)
    
    // Llenar el formulario con los datos de la categoría
    formData.value = {
      name: category.name,
      description: category.description || ''
    }
  } catch (error: any) {
    console.error('Error al cargar categoría:', error)
    
    if (error?.response?.status === 404) {
      generalError.value = 'Categoría no encontrada'
    } else {
      generalError.value = error?.response?.data?.error || 'Error al cargar la categoría'
    }
  } finally {
    loadingCategory.value = false
  }
}

function validateForm() {
  errors.value = {}
  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'El nombre no puede exceder 100 caracteres'
  }

  if (formData.value.description && formData.value.description.length > 500) {
    errors.value.description = 'La descripción no puede exceder 500 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSave() {
  if (!validateForm()) return
  
  loading.value = true
  generalError.value = ''
  
  try {
    const payload = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined
    }
    
    await updateCategory(categoryId.value, payload)
    
    // Navegar con query params para mostrar toast en categoryAdmin
    router.push({
      path: '/adminproductos/categorias',
      query: { success: 'updated', name: payload.name }
    })
  } catch (error: any) {
    console.error('Error al actualizar categoría:', error)
    
    if (error?.response?.status === 409 || error?.response?.data?.message?.includes('único')) {
      generalError.value = `Ya existe una categoría con el nombre "${formData.value.name}"`
    } else if (error?.response?.status === 401) {
      generalError.value = 'No tienes permisos para editar categorías'
    } else if (error?.response?.status === 404) {
      generalError.value = 'Categoría no encontrada'
    } else {
      generalError.value = error?.response?.data?.error || 'Error inesperado al actualizar la categoría'
    }
    
    toast.error('Error al actualizar la categoría', { autoClose: 2000 })
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/adminproductos/categorias')
}
</script>

<style scoped>
/* Estilos mínimos; diseño manejado con Tailwind */
</style>
