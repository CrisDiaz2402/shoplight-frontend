<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Left: Logo + Nav -->
        <div class="flex items-center gap-6">
          <router-link to="/" class="flex items-center gap-3">
            <img src="/src/assets/shoplightLogo.jpg" alt="ShopHub" class="h-8 w-auto" v-if="logoExists" />
            <span v-else class="text-2xl font-extrabold text-slate-900">ShopHub</span>
          </router-link>

          <nav class="hidden md:flex items-center gap-4 text-slate-700">
            <!-- Diseño idéntico; enlaces opcionales -->
          </nav>
        </div>

        <!-- Título del header admin -->
        <div class="flex-1 px-4 text-center">
          <h1 class="text-lg font-semibold text-slate-800">Bienvenidos al administrador del sistema</h1>
        </div>

        <!-- Right: User (visual) -->
        <div class="flex items-center gap-4">
          <div class="relative" ref="profileRef">
            <button @click="$emit('toggle-profile')" class="flex items-center gap-2 text-slate-700 hover:text-slate-900" :aria-expanded="showProfile">
              <Icon icon="mdi:account-circle-outline" width="22" height="22" />
            </button>

            <div v-if="showProfile && logged" class="absolute right-0 mt-2 z-30">
              <PerfilPanelAdmin :user="user || undefined" @logout="$emit('logout')" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import PerfilPanelAdmin from '../components/perfil/perfilPanelAdmin.vue'

const props = defineProps<{
  logoExists?: boolean
  user?: { id?: number; name?: string; email?: string; role?: string }
  showProfile?: boolean
}>()

const emits = defineEmits<{
  (e: 'toggle-profile'): void
  (e: 'logout'): void
  (e: 'purchases'): void
  (e: 'close-profile'): void
}>()

const profileRef = ref<HTMLElement | null>(null)

// search removed for admin header

function onDocumentClick(e: Event) {
  const target = e.target as Node
  if (profileRef.value && !profileRef.value.contains(target)) {
    if (props.showProfile) emits('close-profile')
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const user = computed(() => props.user ?? null)
const logoExists = computed(() => props.logoExists ?? true)
const showProfile = computed(() => props.showProfile ?? false)
const logged = computed(() => !!(props.user && props.user.id))
</script>

<style scoped>
/* Mantener estilos mínimos; diseño con Tailwind */
</style>
