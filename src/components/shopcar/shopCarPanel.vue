<template>
  <div v-if="show" class="fixed inset-0 z-50 flex">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/40" @click="onClose" aria-hidden="true"></div>

    <!-- Panel -->
    <aside class="relative ml-auto w-full max-w-[420px] h-full bg-white shadow-xl overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-xl font-semibold">Carrito de Compras</h3>
        <button @click="onClose" class="text-slate-500 hover:text-slate-800">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="p-4">
        <div v-if="itemsList.length === 0" class="py-8 text-center text-slate-600">
          Tu carrito está vacío
        </div>

        <ul class="space-y-4">
          <li v-for="it in itemsList" :key="it.productId" class="flex items-center gap-4 p-4 rounded-lg border">
            <img :src="productImage(it.product)" alt="" class="h-16 w-16 rounded-md object-cover bg-slate-100" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-slate-800">{{ it.product.name }}</h4>
                <div class="text-blue-600 font-semibold">{{ formatCurrency(it.price) }}</div>
              </div>
              <div class="mt-3 flex items-center gap-3 text-sm text-slate-700">
                <button @click="decrease(it)" class="px-2 py-1 rounded-md border hover:bg-slate-100">−</button>
                <div class="w-6 text-center">{{ it.quantity }}</div>
                <button @click="increase(it)" class="px-2 py-1 rounded-md border hover:bg-slate-100">+</button>
                <button @click="remove(it.productId)" class="ml-auto text-red-500 hover:text-red-700" aria-label="Eliminar">
                  <Icon icon="mdi:delete-outline" width="18" height="18" />
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="mt-6 border-t pt-4">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-slate-700">Total sin IVA:</div>
            <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalAmount) }}</div>
          </div>

          <button @click="checkout" class="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700">
            Proceder al Pago
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  // emits payload compatible with backend Order model
  (e: 'checkout', payload: { userId?: number; total: number; items: Array<{ productId: number; quantity: number; subtotal: number }> }): void
}>()

const userStore = useUserStore()

const cart = useCartStore()

const itemsList = computed(() => cart.items)
const totalAmount = computed(() => cart.totalAmount)

function onClose() {
  emit('close')
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v)
}

function productImage(p: any) {
  return p?.image || p?.imageUrl || '/src/assets/placeholder.png'
}

function increase(item: any) {
  cart.setQuantity(item.productId, item.quantity + 1)
}

function decrease(item: any) {
  cart.setQuantity(item.productId, item.quantity - 1)
}

function remove(productId: number) {
  cart.removeProduct(productId)
}

function checkout() {
  // build payload matching Prisma Order/OrderItem shape
  const payload = {
    userId: userStore.currentUser?.id,
    total: Number(totalAmount.value),
    items: cart.buildOrderItems(),
  }

  emit('checkout', payload)
}
</script>

<style scoped>
/* ensure panel takes full height on smaller screens */
@media (max-width: 480px) {
  aside { width: 100% !important }
}
</style>
