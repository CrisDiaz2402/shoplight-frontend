<template>
    <section class="space-y-6">
        <header class="bg-white text-slate-900 p-8 rounded-md border border-slate-200">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold">Gestión de Categorías</h1>
                    <p class="text-slate-600 mt-2">Organiza tus categorías de productos</p>
                </div>

                <button 
                    @click="handleCreateCategory"
                    class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
                >
                    <Icon icon="mdi:plus" width="18" height="18" />
                    <span>Crear Categoría</span>
                </button>
            </div>
        </header>

        <main>
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span class="ml-2 text-slate-600">Cargando categorías...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                <div class="flex items-center">
                    <Icon icon="mdi:alert-circle" width="20" height="20" class="mr-2" />
                    {{ error }}
                </div>
                <button @click="handleRetry" class="mt-2 text-red-800 underline hover:no-underline">
                    Reintentar
                </button>
            </div>

            <!-- Categories Table -->
            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
                <div v-if="filteredCategories.length === 0" class="text-center py-12">
                    <Icon icon="mdi:folder-open-outline" width="48" height="48" class="mx-auto text-slate-300 mb-4" />
                    <h3 class="text-lg font-medium text-slate-900 mb-2">No hay categorías</h3>
                    <p class="text-slate-500">
                        {{ searchQuery ? 'No se encontraron categorías que coincidan con tu búsqueda.' : 'Comienza creando tu primera categoría.' }}
                    </p>
                </div>

                <table v-else class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Creado
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-200">
                        <tr v-for="category in filteredCategories" :key="category.id" class="hover:bg-slate-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-slate-900">{{ category.name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-slate-500">
                                    {{ category.description || 'Sin descripción' }}
                                </div>
                            </td>
                            
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {{ formatDate(category.createdAt) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button 
                                        @click="handleEdit(category)"
                                        class="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                        title="Editar categoría"
                                    >
                                        <Icon icon="mdi:pencil" width="16" height="16" />
                                    </button>
                                    <button 
                                        @click="handleDelete(category)"
                                        class="text-red-600 hover:text-red-900 p-1 rounded"
                                        title="Eliminar categoría"
                                    >
                                        <Icon icon="mdi:delete" width="16" height="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
        
        <!-- Modal de confirmación de eliminación -->
        <DeletedPanel
          :is-visible="showDeleteModal"
          item-type="categoría"
          :item-name="categoryToDelete?.name || ''"
          @confirm="confirmDelete"
          @cancel="cancelDelete"
        />
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategories } from '../../composables/categories/useCategories'
import type { Category } from '../../types/category'
import DeletedPanel from '../shared/deletedPanel.vue'
import toast from '../../lib/toast'

const router = useRouter()
const route = useRoute()

const {
  filteredCategories,
  loading,
  error,
  searchQuery,
  fetchCategories,
  deleteCategory,
  clearError
} = useCategories()

// Estado para el modal de confirmación
const showDeleteModal = ref(false)
const categoryToDelete = ref<Category | null>(null)

// Cargar categorías al montar el componente
onMounted(async () => {
  await fetchCategories()
  
  // Mostrar toasts de éxito basados en query params después de que todo esté cargado
  const success = route.query.success as string
  const name = route.query.name as string
  
  if (success && name) {
    // Usar setTimeout para asegurar que el toast se muestre después de la redirección
    setTimeout(() => {
      if (success === 'created') {
        toast.success(`Categoría "${name}" creada exitosamente`, { autoClose: 2000 })
      } else if (success === 'updated') {
        toast.success(`Categoría "${name}" actualizada exitosamente`, { autoClose: 2000 })
      }
    }, 100)
    
    // Limpiar los query params después de mostrar el toast
    router.replace({ path: route.path })
  }
})

// Función para formatear fecha
function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

// Handlers
function handleCreateCategory() {
  router.push('/adminproductos/categorias/crear')
}

function handleEdit(category: Category) {
  router.push(`/adminproductos/categorias/${category.id}/editar`)
}

function handleDelete(category: Category) {
  if (category.productCount && category.productCount > 0) {
    alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.productCount} productos asociados.`)
    return
  }

  categoryToDelete.value = category
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!categoryToDelete.value) return
  
  try {
    const categoryName = categoryToDelete.value.name
    await deleteCategory(categoryToDelete.value.id)
    
    toast.success(`Categoría "${categoryName}" eliminada exitosamente`, { autoClose: 2000 })
    showDeleteModal.value = false
    categoryToDelete.value = null
  } catch (err: any) {
    console.error('Error al eliminar categoría:', err)
    const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al eliminar la categoría'
    toast.error(message, { autoClose: 2000 })
    // Mantener el modal abierto en caso de error
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

function handleRetry() {
  clearError()
  fetchCategories()
}
</script>

<style scoped>
/* Minimal additional styling; layout handled by Tailwind classes */
</style>