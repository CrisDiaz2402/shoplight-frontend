<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <HeaderLayourAdmin
      :user="user"
      :logoExists="true"
      :showProfile="showProfile"
      @search="onSearch"
      @purchases="onPurchases"
      @toggle-profile="onToggleProfile"
      @logout="onLogoutAdmin"
      @close-profile="showProfile = false"
    />

    <!-- Main area: sidebar + content -->
    <div class="flex flex-1 bg-gray-50">
      <!-- Sidebar left -->
      <SidebarAdmin />

      <!-- Main content area -->
      <main class="flex-1 p-6">
        <!-- router-view renderiza productsAdmin / usersAdmin / categoryAdmin -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderLayourAdmin from '../layout/headerLayourAdmin.vue'
import SidebarAdmin from '../components/homeAdmin/sidebarAdmin.vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.currentUser ?? undefined)

// Control local del estado del popover en la vista admin
const showProfile = ref(false)

function onSearch(query: string) {
  console.log('Buscar (admin):', query)
}

function onPurchases() {
  router.push('/miscompras')
}

function onToggleProfile() {
  showProfile.value = !showProfile.value
}

function onLogoutAdmin() {
  // Asegurar que el panel se cierre y redirigir al home
  showProfile.value = false
  try {
    userStore.clearUser()
  } catch (e) {
    // ignore
  }
  router.push('/')
}
</script>

<style scoped>
/* Estilos mínimos; la mayoría se maneja con Tailwind */
</style>
