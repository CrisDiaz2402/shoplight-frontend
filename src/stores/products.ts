import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/products')
      // Normalize and keep a stable order in the frontend (by id ascending)
      const list = res?.data ?? []
      products.value = Array.isArray(list) ? list.slice().sort((a: any, b: any) => (a.id ?? 0) - (b.id ?? 0)) : list
      return products.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Error al cargar productos'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setProducts(list: any[]) {
    // when setting products from other callers, keep a stable order too
    const arr = list ?? []
    products.value = Array.isArray(arr) ? arr.slice().sort((a: any, b: any) => (a.id ?? 0) - (b.id ?? 0)) : arr
  }

  return { products, loading, error, fetchProducts, setProducts }
})

export default useProductsStore
