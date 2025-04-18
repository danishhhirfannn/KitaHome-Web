import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/Login.vue'
import SignupView from '../views/Signup.vue'
import HomeView from '../views/HomeView.vue'
//Admin Views
import adminDashboard from '@/views/administrator/adminDashboard.vue'
import profileManagement from '@/views/administrator/profileManagement.vue'
import adminResidenceManagement from '@/views/administrator/residenceManagement.vue'
//Management Views
import managementDashboard from '@/views/management/managementDashboard.vue'
import residentManagement from '@/views/management/residentManagement.vue'
import residenceManagement from '@/views/management/residenceManagement.vue'
import financialManagement from '@/views/management/financialManagement.vue'
import complaintsManagement from '@/views/management/complaintsManagement.vue'
import communicationManagement from '@/views/management/communicationManagement.vue'
import announcementsManagement from '@/views/management/announcementsManagement.vue'
import logsManagement from '@/views/management/logsManagement.vue'
//Resident Views
import residentDashboard from '@/views/resident/residentDashboard.vue'
import financialManagementResident from '@/views/resident/financialManagementResident.vue'
import complaintManagementResident from '@/views/resident/complaintManagementResident.vue'
import complaintDetails from '@/views/resident/complaintDetails.vue'
import chatroom from '@/views/resident/chatroom.vue'
import announcements from '@/views/resident/announcements.vue'
import profile from '@/views/resident/profile.vue'
// Payment Views
import PaymentSuccess from '@/views/resident/PaymentSuccess.vue'
import PaymentCancel from '@/views/resident/PaymentCancel.vue'

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
      path: '/management/residenceManagement',
      name: 'residenceManagement',
      component: residenceManagement,
    },
    {
      path: '/management/financialManagement',
      name: 'financialManagement',
      component: financialManagement,
    },
    {
      path: '/management/complaintsManagement',
      name: 'complaintsManagement',
      component: complaintsManagement,
    },
    {
      path: '/management/communicationManagement',
      name: 'communicationManagement',
      component: communicationManagement,
    },
    {
      path: '/administrator/profileManagement',
      name: 'profileManagement',
      component: profileManagement,
    },
    {
      path: '/administrator/residenceManagement',
      name: 'adminResidenceManagement',
      component: adminResidenceManagement,
    },
    {
      path: '/management/residents/:id',
      name: 'ResidentDetails',
      component: () => import('@/views/management/residentDetails.vue'),
      meta: { requiresAuth: true, roles: ['management'] }
    },
    {
      path: '/management/announcementsManagement',
      name: 'announcementsManagement',
      component: announcementsManagement,
    },
    {
      path: '/resident/financialManagementResident',
      name: 'financialManagementResident',
      component: financialManagementResident,
    },
    {
      path: '/resident/complaintManagementResident',
      name: 'complaintManagementResident',
      component: complaintManagementResident,
    },
    {
      path: '/resident/complaintDetails/:id',
      name: 'complaint-details',
      component: complaintDetails,
    },
    {
      path: '/resident/submitComplaint',
      name: 'submit-complaint',
      component: () => import('@/views/resident/submitComplaint.vue'),
    },
    {
      path: '/resident/chatroom',
      name: 'chatroom',
      component: chatroom,
    },
    {
      path: '/resident/announcements',
      name: 'announcements',
      component: announcements,
    },
    {
      path: '/resident/profile',
      name: 'profile',
      component: profile,
    },
    {
      path: '/management/logsManagement',
      name: 'logsManagement',
      component: logsManagement,
      meta: { requiresAuth: true, roles: ['management'] }
    },
    // Payment related routes
    {
      path: '/payment-success',
      name: 'payment-success',
      component: PaymentSuccess,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment-cancel',
      name: 'payment-cancel',
      component: PaymentCancel,
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // Routes that don't require authentication
  if (to.path === '/' || to.path === '/signup') {
    return next()
  }

  const authStore = useAuthStore()
  
  // Initialize auth store if not already done
  await authStore.initialize()

  const { data: { session } } = await supabase.auth.getSession()

  // Protect routes
  if (!session) {
    return next('/')
  }

  // Route based on user role if they're logged in and going to the root path
  if (to.path === '/') {
    if (authStore.isAdmin) return next('/administrator/adminDashboard')
    if (authStore.isManagement) return next('/management/managementDashboard')
    if (authStore.isResident) return next('/resident/residentDashboard')
  }

  next()
})

export default router
