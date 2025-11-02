import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  productId: number
  product: any
  quantity: number
  price: number
  subtotal: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function findIndex(productId: number) {
    return items.value.findIndex((i) => i.productId === productId)
  }

  function addProduct(product: any, qty = 1) {
    const idx = findIndex(product.id)
    if (idx >= 0) {
      const item = items.value[idx]
      if (item) {
        const nextQty = item.quantity + qty
        // prevent exceed stock
        const allowed = product.stock ?? Infinity
        item.quantity = Math.min(nextQty, allowed)
        item.subtotal = item.quantity * item.price
      }
    } else {
      const quantity = Math.min(qty, product.stock ?? qty)
      items.value.push({
        productId: product.id,
        product,
        quantity,
        price: product.price,
        subtotal: quantity * product.price,
      })
    }
  }

  function removeProduct(productId: number) {
    const idx = findIndex(productId)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function setQuantity(productId: number, quantity: number) {
    const idx = findIndex(productId)
    if (idx >= 0) {
      const item = items.value[idx]
      if (item) {
        const allowed = item.product.stock ?? Infinity
        const q = Math.max(0, Math.min(quantity, allowed))
        item.quantity = q
        item.subtotal = q * item.price
        if (q === 0) removeProduct(productId)
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  const totalItems = computed(() => items.value.reduce((s, it) => s + it.quantity, 0))
  const totalAmount = computed(() => items.value.reduce((s, it) => s + it.subtotal, 0))

  // Prepare order payload compatible with Prisma OrderItem shape
  function buildOrderItems() {
    return items.value.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      subtotal: it.subtotal,
    }))
  }

  return {
    items,
    addProduct,
    removeProduct,
    setQuantity,
    clearCart,
    totalItems,
    totalAmount,
    buildOrderItems,
  }
})
