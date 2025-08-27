import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import NewEvent from '@/components/NewEvent.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import MiCuenta from '@/components/MiCuenta.vue';
import EventDetails from '../views/EventDetails.vue';
import { useUserStore } from '@/stores/user.js';
import ControlPresupuesto from '../views/ControlPresupuesto.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/nuevo-evento',
      name: 'nuevo-evento',
      component: NewEvent,
      meta: { requiresAuth: true },
    },
    {
      path: '/mi-cuenta',
      name: 'mi-cuenta',
      component: MiCuenta,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id',
      name: 'event-details',
      component: EventDetails,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id/presupuesto',
      name: 'event-budget',
      component: ControlPresupuesto,
      meta: { requiresAuth: true },
    }
  ],
});

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    
    if (to.meta.requiresAuth && !userStore.token) {
        next('/login');
    } 
    else if ((to.name === 'login' || to.name === 'register') && userStore.token) {
        next('/');
    }
    else if (userStore.token && !userStore.user) {
        await userStore.fetchUser();
        next();
    }
    else {
        next();
    }
});

export default router;