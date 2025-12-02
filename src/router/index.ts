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
    path: '/miscompras',
    name: 'Compras',
    // lazy-load
    component: () => import('../views/purchasesView.vue'),
  },
  {
    path: '/adminproductos',
    name: 'AdminHome',
    // lazy-load
    component: () => import('../views/homeAdmin.vue'),
    children: [
      {
        path: '',
        name: 'AdminProductos',
        component: () => import('../components/homeAdmin/productsAdmin.vue'),
      },
      {
        path: 'usuarios',
        name: 'AdminUsuarios',
        component: () => import('../components/homeAdmin/usersAdmin.vue'),
      },
      {
        path: 'categorias',
        name: 'AdminCategorias',
        component: () => import('../components/homeAdmin/categoryAdmin.vue'),
      },
      {
        path: 'categorias/crear',
        name: 'CreateCategory',
        component: () => import('../components/formularios/categorias/createCategory.vue'),
      },
      {
        path: 'categorias/:id/editar',
        name: 'EditCategory',
        component: () => import('../components/formularios/categorias/editCategory.vue'),
        props: true,
      },
    ],
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
