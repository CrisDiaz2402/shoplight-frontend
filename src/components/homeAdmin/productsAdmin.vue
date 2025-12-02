<template>
    <section class="space-y-6">
        <header class="bg-white text-slate-900 p-8 rounded-md border border-slate-200">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold">Gestión de Productos</h1>
                    <p class="text-slate-600 mt-2">Administra el inventario de productos</p>
                </div>

                <button class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
                    <Icon icon="mdi:plus" width="18" height="18" />
                    <span>Crear Producto</span>
                </button>
            </div>

            <div class="mt-6">
                <div class="relative">
                    <input
                        type="text"
                        placeholder="Buscar productos por nombre o descripción..."
                        class="w-full rounded-lg border border-slate-200 bg-white placeholder-slate-400 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Buscar productos"
                    />

                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon icon="ic:round-search" width="20" height="20" />
                    </span>
                </div>
            </div>
        </header>

        <main>
            <div class="mt-6 p-4 bg-white rounded shadow">this is product admin</div>
        </main>
    </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<style scoped>
/* Minimal additional styling; layout handled by Tailwind classes */
</style>