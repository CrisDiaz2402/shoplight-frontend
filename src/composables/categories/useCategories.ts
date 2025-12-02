import { ref, computed } from 'vue'
import { api } from '../../lib/api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/category'

export function useCategories() {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // Computed para filtrar categorías
  const filteredCategories = computed(() => {
    if (!searchQuery.value) return categories.value
    const query = searchQuery.value.toLowerCase()
    return categories.value.filter(
      (cat: Category) => 
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    )
  })

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/categories')
      categories.value = Array.isArray(response.data) ? response.data : []
      return categories.value
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Error cargando categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getCategory(id: number) {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data as Category
    } catch (err: any) {
      throw err
    }
  }

  async function createCategory(payload: CreateCategoryDto) {
    try {
      const response = await api.post('/categories', payload)
      const newCategory = response.data as Category
      categories.value.unshift(newCategory)
      return newCategory
    } catch (err: any) {
      throw err
    }
  }

  async function updateCategory(id: number, payload: UpdateCategoryDto) {
    try {
      const response = await api.put(`/categories/${id}`, payload)
      const updatedCategory = response.data as Category
      const index = categories.value.findIndex((c: Category) => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      return updatedCategory
    } catch (err: any) {
      throw err
    }
  }

  async function deleteCategory(id: number) {
    try {
      await api.delete(`/categories/${id}`)
      categories.value = categories.value.filter((c: Category) => c.id !== id)
      return true
    } catch (err: any) {
      throw err
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearError() {
    error.value = null
  }

  return {
    categories,
    filteredCategories,
    loading,
    error,
    searchQuery,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    setSearchQuery,
    clearError
  }
}