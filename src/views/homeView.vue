
<template>
  <HeaderLayout />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <section>
      <h1 class="text-3xl font-extrabold text-slate-900">Descubre Nuestros Productos</h1>
      <p class="mt-2 text-slate-600">Encuentra todo lo que necesitas en un solo lugar</p>

      <div class="mt-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CardsProducts v-for="product in products" :key="product.id" :product="product" @add="addToCart" />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import HeaderLayout from '../layout/headerLayout.vue'
import CardsProducts from '../ui/cardsProducts.vue'
import productsData from '../db/products.json'
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

// Tip: productsData está importado directamente desde JSON centralizado
const products = ref(productsData as any[])

const cart = useCartStore()

function addToCart(product: any) {
  // Añadir al store de Pinia
  cart.addProduct(product, 1)
}
</script>

<style scoped>
/* ajustes menores si son necesarios */
</style>
