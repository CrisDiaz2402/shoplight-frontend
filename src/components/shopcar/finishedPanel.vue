<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="fixed inset-0 bg-black/40 z-40" @click="onClose" aria-hidden="true"></div>

  <div class="bg-white rounded-lg shadow-xl w-[900px] max-w-full mx-4 relative z-50">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-xl font-semibold">Finalizar Compra</h3>
        <button @click="onClose" class="text-slate-500 hover:text-slate-800">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left: delivery & payment form (two columns wide) -->
          <div class="md:col-span-2">
            <h4 class="font-medium mb-4">Información de entrega</h4>
            <form @submit.prevent="confirmOrder" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <input v-model="name" type="text" placeholder="Nombre" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
                <input v-model="lastName" type="text" placeholder="Apellido" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <input v-model="email" type="email" placeholder="Email" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
                <input v-model="phone" type="tel" placeholder="Teléfono" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
              </div>

              <div>
                <input v-model="address" type="text" placeholder="Dirección" class="w-full px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
              </div>

              <div class="grid grid-cols-3 gap-4">
                <input v-model="city" type="text" placeholder="Ciudad" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
                <input v-model="state" type="text" placeholder="Estado" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
                <input v-model="postalCode" type="text" placeholder="Código postal" class="px-4 py-3 border rounded-md bg-white placeholder-slate-300" />
              </div>

              <div class="mt-4 bg-slate-100 p-4 rounded-md">
                <div class="font-medium mb-2">Método de pago</div>
                <div class="flex gap-6">
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" v-model="paymentMethod" value="card" />
                    <span>Tarjeta de crédito</span>
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" v-model="paymentMethod" value="cash" />
                    <span>Efectivo</span>
                  </label>
                  <label class="inline-flex items-center gap-2">
                    <input type="radio" v-model="paymentMethod" value="transfer" />
                    <span>Transferencia bancaria</span>
                  </label>
                </div>
              </div>

              <div class="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">Nota: Este es un pedido simulado. No se procesará ningún pago real.</div>

              <div class="pt-4">
                <button :disabled="submitting" type="submit" class="w-full bg-blue-900 text-white py-3 rounded-md font-medium hover:bg-blue-800 disabled:opacity-60">Confirmar pedido - {{ formatCurrency(totalWithTax) }}</button>
              </div>
            </form>
          </div>

          <!-- Right: summary card -->
          <aside class="md:col-span-1 bg-white border rounded-md p-6 shadow-sm">
            <h4 class="font-semibold mb-4">Resumen del pedido</h4>
            <div class="space-y-3 text-sm text-slate-700 mb-4">
              <div v-for="it in itemsList" :key="it.productId" class="flex items-center justify-between">
                <div>{{ it.product.name }} x {{ it.quantity }}</div>
                <div class="font-medium">{{ formatCurrency(it.subtotal) }}</div>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex items-center justify-between text-sm mb-2"><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
              <div class="flex items-center justify-between text-sm mb-2"><span>IVA (15%)</span><span>{{ formatCurrency(tax) }}</span></div>
              <div class="flex items-center justify-between text-lg font-bold mt-3"><span>Total</span><span class="text-blue-600 text-xl">{{ formatCurrency(totalWithTax) }}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
  <ConfirmPanel :show="showConfirm" @confirm="onConfirmConfirm" @cancel="onConfirmCancel" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'
import ConfirmPanel from './confirmPanel.vue'
import toast from '../../lib/toast'
import { api } from '../../lib/api'
import { useProductsStore } from '../../stores/products'

const props = defineProps<{ show: boolean; pendingOrder?: { userId?: number; total: number; items: Array<{ productId: number; quantity: number; subtotal: number }> } }>()
const emit = defineEmits<{
  (e: 'close'): void
  // emit confirmed order payload compatible with backend Order model (and payment)
  (e: 'confirmed', payload: { userId?: number; total: number; items: Array<{ productId: number; quantity: number; subtotal: number }>; payment: { method: string; paymentDetails?: any } }): void
  // emit updated products list after a successful order so parent can refresh stocks
  (e: 'products-updated', products: any[]): void
}>()

const cart = useCartStore()
const userStore = useUserStore()

const itemsList = computed(() => cart.items)
const totalAmount = computed(() => cart.totalAmount)

const subtotal = computed(() => Number(totalAmount.value))
// IVA cambiado a 15%
const tax = computed(() => Number((subtotal.value * 0.15).toFixed(2)))
const totalWithTax = computed(() => Number((subtotal.value + tax.value).toFixed(2)))

// Form fields (pre-fill from user if available)
const name = ref('')
const email = ref('')
const phone = ref('')
const lastName = ref('')
const address = ref('')
const city = ref('')
const state = ref('')
const postalCode = ref('')

// Payment state
const paymentMethod = ref<'card' | 'cash' | 'transfer'>('card')
const cardNumber = ref('')
const cardName = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const transferReference = ref('')
const submitting = ref(false)
const showConfirm = ref(false)
// Hold the pending payload while the user confirms in the ConfirmPanel
const pendingOrderPayload = ref<any | null>(null)
const pendingFullPayload = ref<any | null>(null)

watch(() => props.show, (val) => {
  if (val) {
    const u = userStore.currentUser
    name.value = u?.name ?? ''
    email.value = u?.email ?? ''
    phone.value = ''
    lastName.value = ''
    address.value = ''
    city.value = ''
    state.value = ''
    postalCode.value = ''
    // prefill from pendingOrder if provided (we keep store as source of truth for items)
    if (props.pendingOrder) {
      // nothing to map for address here
    }
  }
})

function onClose() {
  emit('close')
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v)
}



async function confirmOrder() {
  // No validations: always proceed to show confirmation when user clicks the button.

  const orderPayload = {
    userId: userStore.currentUser?.id,
    // subtotal sin IVA, IVA y total incluyendo IVA
    subtotal: Number(subtotal.value.toFixed(2)),
    iva: Number(tax.value.toFixed(2)),
    total: Number(totalWithTax.value.toFixed(2)),
    items: cart.buildOrderItems(),
  }

  const paymentDetails: any = { }
  if (paymentMethod.value === 'card') {
    paymentDetails.card = {
      number: cardNumber.value.replace(/\s+/g, ''),
      name: cardName.value,
      expiry: cardExpiry.value,
      cvv: cardCvv.value,
    }
  } else if (paymentMethod.value === 'cash') {
    // minimal cash payment details: note that it's a cash payment
    paymentDetails.cash = { note: 'Pago en efectivo' }
  } else if (paymentMethod.value === 'transfer') {
    paymentDetails.transfer = { reference: transferReference.value }
  }

  const payload = {
    order: orderPayload,
    payment: {
      method: paymentMethod.value,
      paymentDetails,
    },
  }

  // No API calls for now: open the confirmation dialog and wait for user decision.
  // store pending payloads so confirm handler can use them
  pendingOrderPayload.value = orderPayload
  pendingFullPayload.value = payload

  submitting.value = true
  showConfirm.value = true
  // do NOT clear cart or emit yet; wait for explicit confirmation from ConfirmPanel
  submitting.value = false
}

function onConfirmCancel() {
  // only close the confirm dialog and keep finished panel open
  showConfirm.value = false
  // keep pending payloads intact in case user re-opens confirm
}

async function onConfirmConfirm() {
  // User confirmed: call backend POST /orders with token in Authorization header (api sets it)
  // require user to be authenticated
  if (!userStore.currentUser) {
    try {
      toast.error('Debes iniciar sesión para completar la compra')
    } catch (e) {}
    showConfirm.value = false
    return
  }

  const order = pendingOrderPayload.value
  const full = pendingFullPayload.value

  const body = {
    // include per-item subtotal (sin IVA) so backend can record OrderItem.subtotal
    items: (order?.items ?? []).map((it: any) => ({ productId: it.productId, quantity: it.quantity, subtotal: it.subtotal })),
    // use subtotal/iva/total from the prepared order payload if available
    subtotal: Number((order?.subtotal ?? subtotal.value).toFixed(2)),
    iva: Number((order?.iva ?? tax.value).toFixed(2)),
    total: Number((order?.total ?? (subtotal.value + tax.value)).toFixed(2)),
    paymentMethod: full?.payment?.method ?? paymentMethod.value,
    paymentDetails: full?.payment?.paymentDetails ?? {},
  }

  submitting.value = true
  try {
    const res = await api.post('/orders', body)

    // Only treat as success when backend confirms it (201 + success: true)
    const isHttpSuccess = res?.status === 201 || (res?.status >= 200 && res?.status < 300)
    const backendSuccess = res?.data?.success !== undefined ? Boolean(res.data.success) : true

      if (isHttpSuccess && backendSuccess) {
      const successMsg = res.data?.message || 'La transacción se ha realizado exitosamente'
      try { toast.success(successMsg) } catch (e) {}

      // perform local confirmation actions using response order
      cart.clearCart()
      // try to refresh product list so parent can update stocks
      try {
        // update global products store so UI se refresca automáticamente
        const productsStore = useProductsStore()
        await productsStore.fetchProducts()
        const productsUpdated = productsStore.products
        // emit updated products so parent (homeView/header) can sync UI if desired
        emit('products-updated', productsUpdated)
      } catch (e) {
        // if refresh fails, ignore but log optionally
        try { console.warn('No se pudo refrescar productos después de la orden', e) } catch (e) {}
      }

      // emit the created order returned by backend if present
      emit('confirmed', res.data?.order ?? (res.data ?? { ...(order ?? {}), payment: full?.payment }))

      // clear pending
      pendingOrderPayload.value = null
      pendingFullPayload.value = null

      // close confirm and finished panel
      showConfirm.value = false
      emit('close')
    } else {
      // Backend did not report success — show message and keep finished panel open for retry
      const msg = res?.data?.message || res?.data?.error || 'La transacción no fue aceptada por el servidor'
      try { toast.error(msg) } catch (e) {}
      // close only the confirm dialog so user can edit or retry
      showConfirm.value = false
    }
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error al procesar la transacción'
    try { toast.error(msg) } catch (e) {}
    // keep finished panel open but close confirm dialog so user can retry or edit
    showConfirm.value = false
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@media (max-width: 640px) {
  .w-\[640px\] { width: calc(100% - 2rem) }
}
</style>
