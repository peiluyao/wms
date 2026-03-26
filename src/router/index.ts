import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      component: () => import('../App.vue'),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'materials',
          name: 'Materials',
          component: () => import('../views/Materials.vue')
        },
        {
          path: 'inventory',
          name: 'Inventory',
          component: () => import('../views/Inventory.vue')
        },
        {
          path: 'inbound',
          name: 'Inbound',
          component: () => import('../views/Inbound.vue')
        },
        {
          path: 'outbound',
          name: 'Outbound',
          component: () => import('../views/Outbound.vue')
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.guest && auth.isLoggedIn) {
    next({ name: 'Dashboard' });
  } else if (!to.meta.guest && !auth.isLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
