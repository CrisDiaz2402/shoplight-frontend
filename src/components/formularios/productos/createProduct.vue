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
          <h2 class="text-3xl font-extrabold text-gray-900">Crear Nuevo Producto</h2>
          <p class="mt-1 text-sm text-gray-600">Agrega un producto al catálogo (Imágenes vía AWS S3)</p>
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
              {{ statusMessage }}
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
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre *</label>
            <div class="mt-1">
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                maxlength="200"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name }"
                placeholder="Ej: Auriculares Inalámbricos"
              />
              <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
            <div class="mt-1">
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                maxlength="1000"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.description }"
                placeholder="Describe brevemente el producto..."
              ></textarea>
              <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description }}</p>
              <p class="mt-2 text-sm text-gray-500">{{ formData.description?.length || 0 }}/1000 caracteres</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">Precio (USD) *</label>
              <div class="mt-1">
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.price }"
                  placeholder="0.00"
                />
                <p v-if="errors.price" class="mt-2 text-sm text-red-600">{{ errors.price }}</p>
              </div>
            </div>

            <div>
              <label for="stock" class="block text-sm font-medium text-gray-700">Stock</label>
              <div class="mt-1">
                <input
                  id="stock"
                  v-model.number="formData.stock"
                  type="number"
                  step="1"
                  min="0"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.stock }"
                  placeholder="0"
                />
                <p v-if="errors.stock" class="mt-2 text-sm text-red-600">{{ errors.stock }}</p>
              </div>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
              <div class="mt-1">
                <select
                  id="category"
                  v-model="formData.categoryId"
                  class="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border"
                >
                  <option :value="null">Sin categoría</option>
                  <option v-for="c in categoriesList" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Imagen del Producto</label>
            <div class="mt-1 flex items-center">
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            <p v-if="selectedFileName" class="mt-1 text-sm text-green-600">
               Archivo seleccionado: {{ selectedFileName }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
               Si no seleccionas imagen, se guardará sin foto.
            </p>
          </div>

          <div v-if="generalError" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error al crear producto</h3>
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
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useProducts } from '../../../composables/productos/useProducts'
import { useCategories } from '../../../composables/categories/useCategories'
import { api } from '../../../lib/api'

type CreateProductDto = {
  name: string
  description?: string
  price: number
  imageUrl?: string | null
  stock?: number
  categoryId?: number | null
}

const router = useRouter()
const { createProduct } = useProducts()
const { fetchCategories, filteredCategories } = useCategories()

// Datos del formulario
const formData = ref<CreateProductDto>({ name: '', description: '', price: 0, imageUrl: '', stock: 0, categoryId: null })

// Estado para el archivo
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')

const loading = ref(false)
const statusMessage = ref('Guardando...') // Para mostrar "Subiendo imagen..." o "Creando..."
const generalError = ref('')
const errors = ref<Record<string, string>>({})

const categoriesList = ref<any[]>([])

const isFormValid = computed(() => {
  const nameOk = !!formData.value.name && formData.value.name.trim().length >= 2
  const priceOk = formData.value.price != null && !isNaN(Number(formData.value.price)) && Number(formData.value.price) >= 0
  return nameOk && priceOk && !loading.value
})

// Manejar selección de archivo
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    selectedFileName.value = target.files[0].name
  } else {
    selectedFile.value = null
    selectedFileName.value = ''
  }
}

function validateForm() {
  errors.value = {}

  if (!formData.value.name || !formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (formData.value.price == null || isNaN(Number(formData.value.price))) {
    errors.value.price = 'El precio es obligatorio'
  } else if (Number(formData.value.price) < 0) {
    errors.value.price = 'El precio no puede ser negativo'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  generalError.value = ''
  statusMessage.value = 'Procesando...'

  try {
    let finalImageKey = null;

    // 1. Si hay archivo, subimos a AWS S3 primero
    if (selectedFile.value) {
      statusMessage.value = 'Subiendo imagen...'
      
      const formDataImage = new FormData()
      formDataImage.append('imagen', selectedFile.value) // Debe coincidir con backend upload.single('imagen')

      // Hacemos POST al endpoint de carga
      // Asumimos que la ruta base de api es '/api' y products router está en '/products'
      const resUpload = await api.post('/products/upload-image', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      finalImageKey = resUpload.data.imageKey // Ej: "productos/123_foto.jpg"
    }

    // 2. Creamos el producto con la Key de la imagen
    statusMessage.value = 'Creando producto...'

    const payload: CreateProductDto = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined,
      price: Number(formData.value.price),
      imageUrl: finalImageKey || undefined, // Enviamos el Key de S3
      stock: formData.value.stock != null ? Number(formData.value.stock) : 0,
      categoryId: formData.value.categoryId ?? undefined
    }

    const created = await createProduct(payload)

    router.push({ path: '/adminproductos', query: { success: 'created', name: created.name } })
  } catch (err: any) {
    console.error('Error al crear producto:', err)
    const message = err?.response?.data?.message || err?.response?.data?.error || 'Error inesperado al crear el producto'
    generalError.value = message
  } finally {
    loading.value = false
    statusMessage.value = 'Guardar'
  }
}

function goBack() {
  router.push('/adminproductos')
}

onMounted(async () => {
  try {
    await fetchCategories()
    categoriesList.value = Array.isArray(filteredCategories.value) ? filteredCategories.value : []
  } catch (err) {
    // ignore
  }
})
</script>

<style scoped>
/* Estilos adicionales si hacen falta */
</style>