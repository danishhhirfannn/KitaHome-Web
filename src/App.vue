<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import SideNavigation from '@/components/SideNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

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
  return showNavigation.value && authStore.isResident
})

const hasSideNav = computed(() => {
  return showNavigation.value && (authStore.isAdmin || authStore.isManagement)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <SideNavigation v-if="hasSideNav" />
    <main :class="{ 'ml-64': hasSideNav, 'mb-16': hasBottomNav }">
      <RouterView />
    </main>
    <BottomNavigation v-if="hasBottomNav" />
  </div>
</template>

<style scoped>
/* Remove unused styles and keep only what's needed */
</style>
