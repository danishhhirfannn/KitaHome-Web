<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import SideNavigation from '@/components/SideNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import AppBar from '@/components/AppBar.vue'

const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchUserDetails()
  console.log('Auth Store State:', {
    isAdmin: authStore.isAdmin,
    isManagement: authStore.isManagement,
    isResident: authStore.isResident,
    currentPath: route.path
  })
})

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
  return showNavigation.value && (authStore.isAdmin || authStore.isManagement)
})

const hasAppBar = computed(() => {
  return showNavigation.value && (authStore.isAdmin || authStore.isManagement)
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
          <RouterView />
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
