import { ref } from 'vue'
import { api } from '../../lib/api'

export interface AuditLog {
  id: string;
  tipo: string;
  timestamp: string;
  detalles: {
    usuario: number;
    monto: number;
    estado: string;
  };
}

export function useAudit() {
  const auditLogs = ref<AuditLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAuditLogs() {
    loading.value = true
    error.value = null
    try {
      // Usamos 'api' que inyecta automáticamente el token del localStorage
      const response = await api.get('/auth/audit')
      
      // El backend devuelve { success: true, count: n, data: [...] }
      if (response.data && response.data.data) {
        auditLogs.value = response.data.data
      } else {
        auditLogs.value = []
      }
    } catch (err: any) {
      console.error(err)
      // Manejo robusto de errores
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        error.value = 'No tienes permisos de administrador o tu sesión expiró.'
      } else {
        error.value = err?.response?.data?.message || err?.message || 'Error cargando auditoría'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs
  }
}