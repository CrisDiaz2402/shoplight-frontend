
<template>
	<article class="bg-white rounded-lg shadow-sm overflow-hidden">
		<div class="aspect-w-4 aspect-h-3 bg-slate-100">
			<img :src="product.imageUrl || placeholder" :alt="product.name" class="object-cover w-full h-full" />
		</div>

		<div class="p-4">
			<span class="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{{ product.category?.name || 'Sin categoría' }}</span>

			<h3 class="mt-3 font-semibold text-lg text-slate-900">{{ product.name }}</h3>

			<p class="mt-2 text-sm text-slate-500 leading-relaxed">{{ product.description }}</p>

			<div class="mt-4 flex items-center justify-between">
				<div>
					<p class="text-2xl font-bold text-slate-900">{{ formatPrice(product.price) }}</p>
					<p class="text-sm text-slate-500">Stock: <span :class="product.stock > 0 ? 'text-slate-700' : 'text-red-600'">{{ product.stock }}</span></p>
				</div>

				<div>
					<button
						@click="$emit('add', product)"
						:disabled="product.stock <= 0"
						class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Icon icon="mdi:cart-outline" width="18" height="18" />
						<span v-if="product.stock > 0">Agregar</span>
						<span v-else>Agotado</span>
					</button>
				</div>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Product {
	id: number
	name: string
	stock: number
	categoryId?: number
	category?: { id: number; name: string }
	price: number
	description: string
	imageUrl?: string
	createdAt?: string
	updatedAt?: string
}

const { product } = defineProps<{ product: Product }>()
const placeholder = ref('/vite.svg')

function formatPrice(v: number) {
	return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<style scoped>
/* Utilizamos utilidades Tailwind; este bloque queda para ajustes puntuales */
.aspect-w-4 {
	position: relative;
	width: 100%;
}
.aspect-w-4 > img {
	display: block;
}
</style>
