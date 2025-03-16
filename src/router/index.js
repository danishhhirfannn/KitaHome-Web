import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/Login.vue'
import SignupView from '../views/Signup.vue'
import HomeView from '../views/HomeView.vue'
//Admin Views
import adminDashboard from '@/views/administrator/adminDashboard.vue'
import profileManagement from '@/views/administrator/profileManagement.vue'
//Management Views
import managementDashboard from '@/views/management/managementDashboard.vue'
import residentManagement from '@/views/management/residentManagement.vue'
//Resident Views
import residentDashboard from '@/views/resident/residentDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/administrator/adminDashboard',
      name: 'adminDashboard',
      component: adminDashboard,
    },
    {
      path: '/management/managementDashboard',
      name: 'managementDashboard',
      component: managementDashboard,
    },
    {
      path: '/resident/residentDashboard',
      name: 'residentDashboard',
      component: residentDashboard,
    },
    {
      path: '/management/residentManagement',
      name: 'residentManagement',
      component: residentManagement,
    },
    {
      path: '/administrator/profileManagement',
      name: 'profileManagement',
      component: profileManagement,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth store if not already done
  await authStore.initialize()

  const { data: { session } } = await supabase.auth.getSession()

  // Routes that don't require authentication
  if (to.path === '/' || to.path === '/signup') {
    if (session) {
      if (authStore.isAdmin) return next('/administrator/adminDashboard')
      if (authStore.isManagement) return next('/management/managementDashboard')
      if (authStore.isResident) return next('/resident/residentDashboard')
    }
    return next()
  }

  // Protect routes
  if (!session) {
    return next('/')
  }

  next()
})

export default router
