<template>
  <aside :class="['bg-white border-r h-screen p-3 transition-all duration-200 ease-in-out flex flex-col', collapsed ? 'w-20' : 'w-56']">
    <div class="flex items-center justify-center mb-4">
      <div class="flex items-center gap-2 justify-center w-full">
        <h2 v-if="!collapsed" class="text-sm font-semibold text-slate-800 text-center">Módulos</h2>
        <span v-else class="sr-only">Módulos</span>

        <button @click="toggle" class="p-1 rounded-md text-slate-600 hover:bg-slate-100 ml-2 flex-shrink-0" :aria-pressed="collapsed" :title="collapsed ? 'Expandir' : 'Plegar'">
          <Icon :icon="collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" width="20" height="20" />
        </button>
      </div>
    </div>

    <nav class="flex flex-col gap-2">
      <router-link
        to="/adminproductos"
        :class="['flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100', isActive('/adminproductos') ? 'bg-slate-100 font-semibold' : '']"
        aria-label="Productos"
        :title="'Productos'"
      >
        <div class="flex items-center justify-center w-6">
          <Icon icon="uil:box" width="24" height="24" />
        </div>
        <span v-if="!collapsed" class="text-sm font-medium">Productos</span>
      </router-link>

      <router-link
        to="/adminproductos/usuarios"
        :class="['flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100', isActive('/adminproductos/usuarios') ? 'bg-slate-100 font-semibold' : '']"
        aria-label="Usuarios"
        :title="'Usuarios'"
      >
        <div class="flex items-center justify-center w-6">
          <Icon icon="mdi:user" width="24" height="24" />
        </div>
        <span v-if="!collapsed" class="text-sm font-medium">Usuarios</span>
      </router-link>

      <router-link
        to="/adminproductos/categorias"
        :class="['flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100', isActive('/adminproductos/categorias') ? 'bg-slate-100 font-semibold' : '']"
        aria-label="Categorías"
        :title="'Categorías'"
      >
        <div class="flex items-center justify-center w-6">
          <Icon icon="material-symbols:category" width="24" height="24" />
        </div>
        <span v-if="!collapsed" class="text-sm font-medium">Categorías</span>
      </router-link>
    </nav>

    <div class="mt-auto text-xs text-slate-400 px-3" v-if="!collapsed">
      © ShopLight
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router'

const collapsed = ref(false)
const route = useRoute()

function toggle() {
  collapsed.value = !collapsed.value
}

function isActive(path: string) {
  // Productos should be active only on exact '/adminproductos'
  if (path === '/adminproductos') return route.path === '/adminproductos'
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
/* Keep styling minimal; Tailwind handles most layout */
</style>
