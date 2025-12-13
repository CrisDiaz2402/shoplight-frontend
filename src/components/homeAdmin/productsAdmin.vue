<template>
    <section class="space-y-6">
        <header class="bg-white text-slate-900 p-8 rounded-md border border-slate-200">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold">Gestión de Productos</h1>
                    <p class="text-slate-600 mt-2">Administra el inventario de productos</p>
                </div>

                <button @click="handleCreateProduct" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
                    <Icon icon="mdi:plus" width="18" height="18" />
                    <span>Crear Producto</span>
                </button>
            </div>

        </header>

        <main>
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span class="ml-2 text-slate-600">Cargando productos...</span>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                <div class="flex items-center">
                    <Icon icon="mdi:alert-circle" width="20" height="20" class="mr-2" />
                    {{ error }}
                </div>
                <button @click="handleRetry" class="mt-2 text-red-800 underline hover:no-underline">Reintentar</button>
            </div>

            <!-- Products Table -->
            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
                <div v-if="filteredProducts.length === 0" class="text-center py-12">
                    <Icon icon="mdi:package-variant-closed" width="48" height="48" class="mx-auto text-slate-300 mb-4" />
                    <h3 class="text-lg font-medium text-slate-900 mb-2">No hay productos</h3>
                    <p class="text-slate-500">{{ searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Comienza creando tu primer producto.' }}</p>
                </div>

                <table v-else class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Imagen</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Creado</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-200">
                        <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-slate-50">
                            <td class="px-4 py-4">
                                <div class="w-16 h-12 overflow-hidden rounded-md bg-slate-100 flex items-center justify-center">
                                    <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name" class="w-full h-full object-cover" />
                                    <div v-else class="text-slate-400 text-xs">No imagen</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-slate-900">{{ p.name }}</div></td>
                            <td class="px-6 py-4"><div class="text-sm text-slate-500">{{ formatPrice(p.price) }}</div></td>
                            <td class="px-6 py-4"><div class="text-sm text-slate-500">{{ p.stock ?? 0 }}</div></td>
                            <td class="px-6 py-4"><div class="text-sm text-slate-500">{{ p.category?.name || 'Sin categoría' }}</div></td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ formatDate(p.createdAt) }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="handleEdit(p)" class="text-indigo-600 hover:text-indigo-900 p-1 rounded" title="Editar producto">
                                        <Icon icon="mdi:pencil" width="16" height="16" />
                                    </button>
                                    <button @click="handleDelete(p)" class="text-red-600 hover:text-red-900 p-1 rounded" title="Eliminar producto">
                                        <Icon icon="mdi:delete" width="16" height="16" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <!-- Modal -->
        <DeletedPanel
            :is-visible="showDeleteModal"
            item-type="producto"
            :item-name="productToDelete?.name || ''"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useProducts } from '../../composables/productos/useProducts'
import DeletedPanel from '../shared/deletedPanel.vue'
import toast from '../../lib/toast'

const router = useRouter()
const route = useRoute()

const {
    filteredProducts,
    loading,
    error,
    searchQuery,
    fetchProducts,
    deleteProduct,
    clearError
} = useProducts()

const showDeleteModal = ref(false)
const productToDelete = ref<any | null>(null)

onMounted(async () => {
    await fetchProducts()

    const success = route.query.success as string
    const name = route.query.name as string
    if (success && name) {
        setTimeout(() => {
            if (success === 'created') {
                toast.success(`Producto "${name}" creado exitosamente`, { autoClose: 2000 })
            } else if (success === 'updated') {
                toast.success(`Producto "${name}" actualizado exitosamente`, { autoClose: 2000 })
            }
        }, 100)

        router.replace({ path: route.path })
    }
})

function formatDate(dateString?: string) {
    if (!dateString) return 'N/A'
    try {
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
        return 'N/A'
    }
}

function formatPrice(value: number | undefined) {
    if (value == null) return '—'
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function handleCreateProduct() {
    router.push('/adminproductos/productos/crear')
}

function handleEdit(p: any) {
    router.push(`/adminproductos/productos/${p.id}/editar`)
}

function handleDelete(p: any) {
    productToDelete.value = p
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!productToDelete.value) return
    try {
        const name = productToDelete.value.name
        await deleteProduct(productToDelete.value.id)
        toast.success(`Producto "${name}" eliminado exitosamente`, { autoClose: 2000 })
        showDeleteModal.value = false
        productToDelete.value = null
    } catch (err: any) {
        console.error('Error al eliminar producto:', err)
        const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al eliminar el producto'
        toast.error(message, { autoClose: 2000 })
    }
}

function cancelDelete() {
    showDeleteModal.value = false
    productToDelete.value = null
}

function handleRetry() {
    clearError()
    fetchProducts()
}
</script>

<style scoped>
/* Minimal additional styling; layout handled by Tailwind classes */
</style>