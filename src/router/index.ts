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
        path: 'usuarios/crear',
        name: 'CreateAdmin',
        component: () => import('../components/formularios/admin/createAdmin.vue'),
      },
      {
        path: 'usuarios/:id/editar',
        name: 'EditAdmin',
        component: () => import('../components/formularios/admin/editAdmin.vue'),
        props: true,
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
      {
        path: 'productos/crear',
        name: 'CreateProduct',
        component: () => import('../components/formularios/productos/createProduct.vue'),
      },
      {
        path: 'productos/:id/editar',
        name: 'EditProduct',
        component: () => import('../components/formularios/productos/editProduct.vue'),
        props: true,
      },
      {
        path: 'auditoria',
        name: 'AuditLogs',
        component: () => import('../components/homeAdmin/auditLogsAdmin.vue'),
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
