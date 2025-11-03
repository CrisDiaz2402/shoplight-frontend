
<template>
  <HeaderLayout />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <section>
      <h1 class="text-3xl font-extrabold text-slate-900">Descubre Nuestros Productos</h1>
      <p class="mt-2 text-slate-600">Encuentra todo lo que necesitas en un solo lugar</p>

      <div class="mt-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CardsProducts v-for="product in productsStore.products" :key="product.id" :product="product" @add="addToCart" />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import HeaderLayout from '../layout/headerLayout.vue'
import CardsProducts from '../ui/cardsProducts.vue'
import { onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useProductsStore } from '../stores/products'
import { toast } from '../lib/toast'

// Use products store for centralized product list and refreshing
const productsStore = useProductsStore()
const cart = useCartStore()

onMounted(() => {
  // fetch products into the central store
  productsStore.fetchProducts().catch(() => {})
})

function addToCart(product: any) {
  // Añadir al store de Pinia
  cart.addProduct(product, 1)
  // Mostrar toast de éxito al agregar
  try {
    toast.success(`${product.name} se ha agregado al carrito`)
  } catch (e) {
    // no bloquear en caso de error con el toast
  }
}
</script>

<style scoped>
/* ajustes menores si son necesarios */
</style>
