<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <div class="fixed inset-0 bg-black/40 z-[9998]" @click="onCancel" aria-hidden="true"></div>

    <div class="bg-white rounded-lg shadow-xl w-[420px] max-w-full mx-4 p-6 relative z-[10000]">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 bg-yellow-100 rounded-full p-3">
          <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 9v2" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold">Confirmar transacción</h3>
          <p class="text-sm text-slate-600 mt-2">¿Está seguro de confirmar la transacción?</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="onCancel" class="px-4 py-2 bg-gray-200 text-slate-700 rounded-md hover:bg-gray-300">Cancelar</button>
        <button @click="onConfirm" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
/* keep simple */
</style>
