<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import SideNavigation from '@/components/SideNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import AppBar from '@/components/AppBar.vue'
import { supabase } from '@/api/supabase'

const route = useRoute()
const authStore = useAuthStore()
const isManagementVerified = ref(true) // Default to true, will be updated on mount if management

onMounted(async () => {
  // Skip authentication for public routes
  const publicRoutes = ['/', '/signup']
  if (publicRoutes.includes(route.path)) {
    console.log('Auth Store State:', {
      isAdmin: false,
      isManagement: false,
      isResident: false,
      currentPath: route.path
    })
    return
  }
  
  await authStore.fetchUserDetails()
  console.log('Auth Store State:', {
    isAdmin: authStore.isAdmin,
    isManagement: authStore.isManagement,
    isResident: authStore.isResident,
    currentPath: route.path
  })
  
  // Check verification status for management users
  if (authStore.isManagement) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Get user details
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('isVerified')
          .eq('userID', authUser.id)
          .single()
          
        if (!userError && userData) {
          isManagementVerified.value = userData.isVerified || false
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }
})

// Update verification status from dashboard component
const updateManagementVerification = (status) => {
  isManagementVerified.value = status
}

const showNavigation = computed(() => {
  const publicRoutes = ['/', '/signup']
  return !publicRoutes.includes(route.path)
})

const hasBottomNav = computed(() => {
  // Don't show bottom nav on chatroom page
  if (route.path === '/resident/chatroom') {
    return false
  }
  return showNavigation.value && authStore.isResident
})

const hasSideNav = computed(() => {
  // For management users, only show sidenav if they are verified
  if (authStore.isManagement) {
    return showNavigation.value && isManagementVerified.value
  }
  // For admin users, always show sidenav
  return showNavigation.value && authStore.isAdmin
})

const hasAppBar = computed(() => {
  // For management users, only show appbar if they are verified
  if (authStore.isManagement) {
    return showNavigation.value && isManagementVerified.value
  }
  // For admin users, always show appbar
  return showNavigation.value && authStore.isAdmin
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex flex-col min-h-screen">
      <!-- App Bar -->
      <AppBar v-if="hasAppBar" />
      
      <!-- Main Content Area -->
      <div class="flex flex-1">
        <!-- Side Navigation -->
        <SideNavigation v-if="hasSideNav" />
        
        <!-- Main Content -->
        <main 
          :class="[
            'flex-1',
            hasSideNav ? 'ml-[70px]' : '',
            hasAppBar ? 'pt-0' : ''
          ]"
        >
          <RouterView @update:sidenavVisibility="updateManagementVerification" />
        </main>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation v-if="hasBottomNav" class="fixed bottom-0 left-0 w-full" />
    </div>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

main {
  min-height: calc(100vh - 64px); /* Subtract AppBar height */
}
</style>
