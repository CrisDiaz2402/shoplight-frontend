<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="handleCancel"
  >
    <!-- Modal Container -->
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <Icon icon="mdi:alert-circle" class="h-6 w-6 text-red-600" />
        </div>
        
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
          Confirmación de eliminación
        </h3>
        
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            ¿Está seguro de eliminar {{ articleAndType }} 
            <span class="font-medium text-gray-900">"{{ itemName }}"</span>?
          </p>
          <p v-if="warningMessage" class="text-sm text-red-600 mt-2">
            {{ warningMessage }}
          </p>
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="flex gap-3 px-6 py-3">
        <button
          @click="handleCancel"
          type="button"
          class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          :disabled="loading"
        >
          Cancelar
        </button>
        
        <button
          @click="handleConfirm"
          type="button"
          class="flex-1 bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          <div v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Eliminando...
          </div>
          <span v-else>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import toast from '../../lib/toast'

export interface DeleteModalProps {
  isVisible: boolean
  itemType: 'producto' | 'usuario' | 'categoria' | string
  itemName: string
  warningMessage?: string
}

export interface DeleteModalEmits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<DeleteModalProps>(), {
  warningMessage: ''
})

const emit = defineEmits<DeleteModalEmits>()

const loading = ref(false)

// Computed para generar el artículo y tipo dinámicamente
const articleAndType = computed(() => {
  const type = props.itemType.toLowerCase()
  
  // Determinar artículo basado en el género de la palabra
  const femaleWords = ['categoria', 'categoría']
  const article = femaleWords.includes(type) ? 'la' : 'el'
  
  return `${article} ${type}`
})

async function handleConfirm() {
  loading.value = true
  
  try {
    emit('confirm')
    // No mostramos toast aquí, lo hace el componente padre después del éxito
  } catch (error) {
    console.error('Error en confirmación:', error)
    toast.error('Error inesperado al procesar la eliminación')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  if (loading.value) return // No permitir cancelar durante carga
  emit('cancel')
}
</script>

<style scoped>
/* Estilos específicos del modal - manejado principalmente con Tailwind */
</style>
