<template>
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-20">
				<!-- Left: Logo + Nav -->
				<div class="flex items-center gap-6">
					<router-link to="/" class="flex items-center gap-3">
						<img src="/src/assets/shoplightLogo.jpg" alt="ShopHub" class="h-8 w-auto" v-if="logoExists" />
						<span v-else class="text-2xl font-extrabold text-slate-900">ShopHub</span>
					</router-link>

					<nav class="hidden md:flex items-center gap-4 text-slate-700">
						<router-link to="/" class="hover:text-slate-900">Inicio</router-link>
						<router-link to="/productos" class="hover:text-slate-900">Productos</router-link>
						<router-link to="/categorias" class="hover:text-slate-900">Categorías</router-link>
					</nav>
				</div>

				<!-- Center: Search -->
				<div class="flex-1 px-4">
					<form @submit.prevent="onSearch" class="max-w-xl mx-auto">
						<label for="search" class="sr-only">Buscar productos</label>
						<div class="relative">
							<input
								id="search"
								v-model="query"
								type="search"
								placeholder="Buscar productos..."
								class="w-full pl-4 pr-10 py-3 border rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								aria-label="Buscar productos"
							/>
							<button
								type="submit"
								class="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent p-2 rounded-md text-slate-600 hover:text-slate-900"
								aria-label="Buscar"
							>
								<Icon icon="ic:round-search" width="20" height="20" />
							</button>
						</div>
					</form>
				</div>

				<!-- Right: Cart + User -->
				<div class="flex items-center gap-4">
					<button class="flex items-center gap-2 text-slate-700 hover:text-slate-900">
						<Icon icon="mdi:cart-outline" width="22" height="22" />
						<span class="hidden sm:inline">Carrito</span>
						<span class="ml-1 inline-flex items-center justify-center bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5">{{ totalItems }}</span>
					</button>

					<div class="relative" ref="profileRef">
						<button @click="toggleProfile" class="flex items-center gap-2 text-slate-700 hover:text-slate-900" :aria-expanded="showProfile">
							<Icon icon="mdi:account-circle-outline" width="22" height="22" />
						</button>

						<div v-if="showProfile && logged" class="absolute right-0 mt-2 z-30">
								<PerfilPanel :user="user" @logout="onLogout" />
							</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Auth modal (login/register) -->
		<AuthModal :show="showAuth" :initial-mode="authMode" @close="showAuth = false" @authenticated="onAuth" @registered="onAuth" />
	</header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useCartStore } from '../stores/cart'
import PerfilPanel from '../components/perfil/perfilPanel.vue'
import { useUserStore } from '../stores/user'
import AuthModal from '../components/auth/authModal.vue'

// Busqueda local
const query = ref('')
function onSearch() {
	// Por ahora solo loguear; en la app real se debe redirigir o emitir evento
	console.log('Buscar:', query.value)
	// ejemplo: router.push({ name: 'Productos', query: { q: query.value } })
}

// Comprobación simple de asset (si existe el logo en assets)
// Si no existe, mostramos texto como fallback
const logoExists = computed(() => {
	try {
		// Import dinámico no se ejecuta en tiempo de template; esta es una marca simple
		// Mantener true para intentar usar el asset si lo agregas
		return true
	} catch (e) {
		return false
	}
})

// Pinia: contador de items en carrito
const cart = useCartStore()
const totalItems = computed(() => cart.totalItems)

// Perfil popover
const showProfile = ref(false)
const profileRef = ref<HTMLElement | null>(null)
// Auth modal state
const showAuth = ref(false)
const authMode = ref<'login' | 'register'>('login')
const userStore = useUserStore()
// Estado de sesión: derivado del userStore
const logged = computed(() => userStore.isAuthenticated)
// sample user shaped like Prisma User model for development/testing
const sampleUser = {
	id: 1,
	email: 'usuario@gmail.com',
	name: 'usuario',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
}
const user = computed(() => userStore.currentUser ?? sampleUser)

function toggleProfile() {
	if (!logged.value) {
		// abrir modal de autenticación en modo login
		authMode.value = 'login'
		showAuth.value = true
		return
	}
	showProfile.value = !showProfile.value
}

function onAuth() {
	// Cuando el usuario se autentica o registra, cerrar modal
	showAuth.value = false
	showProfile.value = false
}

function onLogout() {
	// evento clickeable sin funcionalidad por ahora
	showProfile.value = false
	console.log('Cerrar sesión (no implementado)')
}

function onDocumentClick(e: Event) {
	const target = e.target as Node
	if (profileRef.value && !profileRef.value.contains(target)) {
		showProfile.value = false
	}
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped>
/* Pequeñas mejoras si Tailwind no cubre algo específico */
</style>

