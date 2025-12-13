<template>
    <section class="space-y-6">
        <header class="bg-white text-slate-900 p-8 rounded-md border border-slate-200">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold">Gestión de Administradores</h1>
                    <p class="text-slate-600 mt-2">Administra los usuarios del sistema</p>
                </div>

                <button @click="handleCreateUser" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
                    <Icon icon="mdi:plus" width="18" height="18" />
                    <span>Crear Administrador</span>
                </button>
            </div>
        </header>

        <main>
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center p-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span class="ml-2 text-slate-600">Cargando administradores...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                <div class="flex items-center">
                    <Icon icon="mdi:alert-circle" width="20" height="20" class="mr-2" />
                    {{ error }}
                </div>
                <button @click="handleRetry" class="mt-2 text-red-800 underline hover:no-underline">Reintentar</button>
            </div>

            <!-- Users Table -->
            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
                <div v-if="filteredUsers.length === 0" class="text-center py-12">
                    <Icon icon="mdi:account-group-outline" width="48" height="48" class="mx-auto text-slate-300 mb-4" />
                    <h3 class="text-lg font-medium text-slate-900 mb-2">No hay administradores</h3>
                    <p class="text-slate-500">{{ searchQuery ? 'No se encontraron administradores que coincidan con tu búsqueda.' : 'Comienza creando tu primer administrador.' }}</p>
                </div>

                <table v-else class="min-w-full">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Creado</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-200">
                        <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50">
                            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-slate-900">{{ user.name }}</div></td>
                            <td class="px-6 py-4"><div class="text-sm text-slate-500">{{ user.email }}</div></td>
                            <td class="px-6 py-4 text-center"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ user.role || 'client' }}</span></td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ formatDate(user.createdAt) }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="handleEdit(user)" class="text-indigo-600 hover:text-indigo-900 p-1 rounded" title="Editar usuario">
                                        <Icon icon="mdi:pencil" width="16" height="16" />
                                    </button>
                                    <button @click="handleDelete(user)" class="text-red-600 hover:text-red-900 p-1 rounded" title="Eliminar usuario">
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
            item-type="usuario"
            :item-name="userToDelete?.name || ''"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsers } from '../../composables/users/useUsers'
import type { User } from '../../types/user'
import DeletedPanel from '../shared/deletedPanel.vue'
import toast from '../../lib/toast'

const router = useRouter()
const route = useRoute()

const {
    filteredUsers,
    loading,
    error,
    searchQuery,
    fetchUsers,
    deleteUser,
    clearError
} = useUsers()

// Estado para el modal de confirmación
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

onMounted(async () => {
    await fetchUsers()

    // Mostrar toasts de éxito basados en query params (creación/actualización)
    const success = route.query.success as string
    const name = route.query.name as string

    if (success && name) {
        setTimeout(() => {
            if (success === 'created') {
                toast.success(`Usuario "${name}" creado exitosamente`, { autoClose: 2000 })
            } else if (success === 'updated') {
                toast.success(`Usuario "${name}" actualizado exitosamente`, { autoClose: 2000 })
            }
        }, 100)

        // Limpiar query params
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

function handleCreateUser() {
    router.push('/adminproductos/usuarios/crear')
}

function handleEdit(user: User) {
    router.push(`/adminproductos/usuarios/${user.id}/editar`)
}

function handleDelete(user: User) {
    userToDelete.value = user
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!userToDelete.value) return
    try {
        const name = userToDelete.value.name
        await deleteUser(userToDelete.value.id)
        toast.success(`Usuario "${name}" eliminado exitosamente`, { autoClose: 2000 })
        showDeleteModal.value = false
        userToDelete.value = null
    } catch (err: any) {
        console.error('Error al eliminar usuario:', err)
        const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al eliminar el usuario'
        toast.error(message, { autoClose: 2000 })
    }
}

function cancelDelete() {
    showDeleteModal.value = false
    userToDelete.value = null
}

function handleRetry() {
    clearError()
    fetchUsers()
}
</script>

<style scoped>
/* Minimal additional styling; layout handled by Tailwind classes */
</style>