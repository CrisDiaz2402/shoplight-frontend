import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/homeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  // ejemplo de ruta adicional para productos (por si se necesita más adelante)
  {
    path: '/productos',
    name: 'Productos',
    // lazy-load
    component: () => import('../views/homeView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: HomeView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
