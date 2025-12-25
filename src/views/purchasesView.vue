<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <button 
          @click="$router.push('/')" 
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Icon icon="ion:return-up-back" width="20" height="20" />
          <span class="text-sm font-medium">Volver al inicio</span>
        </button>
      </div>

      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mis Compras</h1>
            <p class="mt-2 text-gray-600">Historial de todas tus órdenes</p>
          </div>
          <div class="ml-4">
            <button
              @click="fetchOrders"
              :disabled="loading"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Refrescar estado"
              title="Consultar si SQS ya procesó los pedidos"
            >
              <Icon 
                icon="material-symbols:refresh" 
                width="20" 
                height="20" 
                :class="{ 'spin-animation': loading }"
              />
              <span class="font-medium text-sm">
                {{ loading ? 'Verificando...' : 'Actualizar Estado' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading && orders.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-800 font-medium mb-2">Error al cargar las compras</div>
        <p class="text-red-600 text-sm mb-4">{{ error }}</p>
        <button @click="fetchOrders" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Reintentar
        </button>
      </div>

      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Icon icon="mdi:shop-off" width="80" height="80" class="text-gray-400 mb-4" />
        <p class="text-lg text-gray-600 max-w-md">No tienes compras realizadas, realiza alguna compra primero</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="px-6 py-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Orden #{{ order.id }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="flex items-center">
                  <span 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                    :class="order.status === 'PROCESADO' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-yellow-50 text-yellow-800 border-yellow-200'"
                  >
                    <Icon 
                      :icon="order.status === 'PROCESADO' ? 'heroicons:check-circle' : 'heroicons:clock'" 
                      class="mr-1.5"
                      width="14"
                    />
                    {{ order.status === 'sales' ? 'Pendiente (En cola)' : 'Procesado' }}
                  </span>
                </div>
              </div>
              <div class="mt-4 sm:mt-0 text-right">
                <p class="text-2xl font-bold text-gray-900">${{ order.total.toFixed(2) }}</p>
                <p class="text-sm text-gray-500">Total</p>
              </div>
            </div>
            
            <div class="mt-4 flex justify-center">
              <button 
                @click="toggleOrder(order.id)"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>{{ isExpanded(order.id) ? 'Ver menos' : 'Ver más' }}</span>
                <svg 
                  class="w-4 h-4 transform transition-transform duration-200" 
                  :class="{ 'rotate-180': isExpanded(order.id) }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="isExpanded(order.id)" class="border-t border-gray-200 px-6 py-4">
            <h4 class="text-sm font-medium text-gray-700 mb-4">Productos ({{ order.items.length }})</h4>
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-4">
                <div class="flex-shrink-0 w-16 h-16">
                  <img 
                    :src="item.product.imageUrl" 
                    :alt="item.product.name"
                    class="w-full h-full object-cover rounded-lg border"
                    @error="handleImageError"
                  >
                </div>
                
                <div class="flex-grow min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 truncate">{{ item.product.name }}</h5>
                  <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ item.product.description }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="text-sm text-gray-600">Cantidad: {{ item.quantity }}</span>
                    <span class="text-sm text-gray-600">Precio unit.: ${{ item.product.price.toFixed(2) }}</span>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">${{ item.subtotal.toFixed(2) }}</p>
                  <p class="text-xs text-gray-500">Subtotal</p>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="text-gray-900">${{ order.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">IVA:</span>
                  <span class="text-gray-900">${{ order.iva.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between font-semibold text-lg border-t pt-2">
                  <span class="text-gray-900">Total:</span>
                  <span class="text-gray-900">${{ order.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '../lib/api'
import toast from '../lib/toast'

// Types based on the API response
interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  createdAt: string
  updatedAt: string
  stock: number
  categoryId: number
}

interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  subtotal: number
  product: Product
}

interface Order {
  id: number
  userId: number
  total: number
  status: string
  createdAt: string
  updatedAt: string
  subtotal: number
  iva: number
  items: OrderItem[]
}

// Reactive state
const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
// Track which orders are expanded
const expandedOrders = ref<Set<number>>(new Set())

/**
 * Fetch orders from the API
 * Esta función es el corazón de la demo de SQS. 
 * Al llamarla, consultamos la BD para ver si el worker ya actualizó el estado.
 */
async function fetchOrders() {
  try {
    // Activamos loading para dar feedback visual en el botón
    loading.value = true
    error.value = null
    
    const response = await api.get('/orders')
    orders.value = response.data || []
    
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    error.value = err.response?.data?.message || 'No se pudieron cargar las órdenes'
    toast.error('Error al cargar el historial de compras')
  } finally {
    loading.value = false
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return dateString
  }
}

/**
 * Handle image load errors
 */
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/64x64?text=Sin+Imagen'
}

/**
 * Toggle order expansion
 */
function toggleOrder(orderId: number) {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId)
  } else {
    expandedOrders.value.add(orderId)
  }
}

/**
 * Check if order is expanded
 */
function isExpanded(orderId: number): boolean {
  return expandedOrders.value.has(orderId)
}

// Load orders when component mounts
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
/* Utility for multi-line text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animación para el icono de refrescar */
.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(3600deg); }
}
</style>