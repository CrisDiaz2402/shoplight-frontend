<template>
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center gap-6">
                    <router-link to="/" class="flex items-center gap-3">
                        <img src="/src/assets/shoplightLogo.jpg" alt="ShopHub" class="h-8 w-auto" v-if="logoExists" />
                        <span v-else class="text-2xl font-extrabold text-slate-900">ShopHub</span>
                    </router-link>

                    <nav class="hidden md:flex items-center gap-4 text-slate-700">
                    </nav>
                </div>

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

                <div class="flex items-center gap-4">
                    <button @click="openCart" class="flex items-center gap-2 text-slate-700 hover:text-slate-900">
                        <Icon icon="mdi:cart-outline" width="22" height="22" />
                        <span class="hidden sm:inline">Carrito</span>
                        <span class="ml-1 inline-flex items-center justify-center bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5">{{ totalItems }}</span>
                    </button>

                    <div class="relative" ref="profileRef">
                        <button @click="toggleProfile" class="flex items-center gap-2 text-slate-700 hover:text-slate-900" :aria-expanded="showProfile">
                            <Icon icon="mdi:account-circle-outline" width="22" height="22" />
                        </button>

                        <div v-if="showProfile && logged" class="absolute right-0 mt-2 z-30">
                                <PerfilPanel :user="user" @logout="onLogout" @purchases="onGoToPurchases" />
                            </div>
                    </div>
                </div>
            </div>
        </div>

        <ShopCarPanel :show="showCart" @close="showCart = false" @checkout="onCheckout" />

        <FinishedPanel :show="showFinished" :pending-order="pendingOrder" @close="showFinished = false" @confirmed="(payload) => { console.log('Orden confirmada:', payload) }" />

        <AuthModal :show="uiStore.showAuth" :initial-mode="uiStore.authMode" @close="uiStore.closeLogin" @authenticated="onAuth" @registered="onAuth" />
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useCartStore } from '../stores/cart'
import PerfilPanel from '../components/perfil/perfilPanel.vue'
import { useUserStore } from '../stores/user'
import AuthModal from '../components/auth/authModal.vue'
import ShopCarPanel from '../components/shopcar/shopCarPanel.vue'
import FinishedPanel from '../components/shopcar/finishedPanel.vue'
import { useUiStore } from '../stores/ui'
import { useProductsStore } from '../stores/products'

const router = useRouter()
const productsStore = useProductsStore()

// Busqueda local
const query = ref('')
// Variable para almacenar el temporizador del debounce
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function onSearch() {
    // Si el usuario no está en la página principal, redirigir
    if (router.currentRoute.value.path !== '/') {
        await router.push('/')
    }
    
    // Llamar al backend con el término de búsqueda
    await productsStore.fetchProducts(query.value)
}

// --- IMPLEMENTACIÓN DE DEBOUNCE (CORREGIDO) ---
// Quitamos el argumento 'newVal' para evitar el warning "declared but never read"
watch(query, () => {
    // 1. Si el usuario escribe antes de que pasen los 300ms, limpiamos el timer anterior
    if (debounceTimer) clearTimeout(debounceTimer)

    // 2. Iniciamos un nuevo timer
    debounceTimer = setTimeout(() => {
        // Ejecutamos la búsqueda automáticamente tras 300ms de inactividad
        onSearch()
    }, 300)
})

// Comprobación simple de asset
const logoExists = computed(() => {
    try {
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
const uiStore = useUiStore()
// Cart panel state
const showCart = ref(false)
// Finished order panel
const showFinished = ref(false)
// pending order payload forwarded from ShopCarPanel to FinishedPanel
const pendingOrder = ref<any | null>(null)
// authMode is read from uiStore directly in template
const userStore = useUserStore()
// Estado de sesión
const logged = computed(() => userStore.isAuthenticated)
// sample user
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
        uiStore.openLogin('login')
        return
    }
    showProfile.value = !showProfile.value
}

function openCart() {
    if (!logged.value) {
        uiStore.openLogin('login')
        return
    }
    showCart.value = true
}

function onAuth(payload?: any) {
    uiStore.closeLogin()
    showProfile.value = false

    const role = payload?.user?.role ?? userStore.currentUser?.role

    if (role === 'admin') {
        router.push('/adminproductos')
    } else {
        router.push('/')
    }
}

function onCheckout(payload?: any) {
    showCart.value = false
    pendingOrder.value = payload ?? null
    showFinished.value = true
}

function onLogout() {
    showProfile.value = false
    try {
        cart.clearCart()
    } catch (e) {
        // ignore
    }
    pendingOrder.value = null
}

function onGoToPurchases() {
    showProfile.value = false
    router.push('/miscompras')
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