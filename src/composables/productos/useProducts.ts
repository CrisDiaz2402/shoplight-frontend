import { ref, computed } from 'vue'
import { api } from '../../lib/api'

export interface CreateProductDto {
  name: string
  description?: string
  price: number
  imageUrl?: string | null
  stock?: number
  categoryId?: number | null
}

export interface UpdateProductDto {
  name?: string
  description?: string | null
  price?: number
  imageUrl?: string | null
  stock?: number
  categoryId?: number | null
}

export function useProducts() {
  const products = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const q = searchQuery.value.toLowerCase()
    return products.value.filter(p =>
      (p.name || '').toString().toLowerCase().includes(q) ||
      (p.description || '').toString().toLowerCase().includes(q)
    )
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products')
      products.value = Array.isArray(response.data) ? response.data : []
      return products.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Error cargando productos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getProduct(id: number) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (err: any) {
      throw err
    }
  }

  async function createProduct(payload: CreateProductDto) {
    try {
      const response = await api.post('/products', payload)
      const created = response.data
      products.value.unshift(created)
      return created
    } catch (err: any) {
      throw err
    }
  }

  async function updateProduct(id: number, payload: UpdateProductDto) {
    try {
      const response = await api.put(`/products/${id}`, payload)
      const updated = response.data
      const idx = products.value.findIndex(p => p.id === id)
      if (idx !== -1) products.value[idx] = updated
      return updated
    } catch (err: any) {
      throw err
    }
  }

  async function deleteProduct(id: number) {
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err: any) {
      throw err
    }
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q
  }

  function clearError() {
    error.value = null
  }

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchQuery,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    setSearchQuery,
    clearError,
  }
}

export default useProducts
