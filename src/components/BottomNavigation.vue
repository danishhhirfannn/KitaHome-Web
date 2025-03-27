<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const navigationItems = [
  { 
    icon: 'pi pi-home',
    text: 'Home',
    to: '/resident/residentDashboard'
  },
  {
    icon: 'pi pi-user',
    text: 'Profile',
    to: '/resident/profile'
  },
  { 
    icon: 'pi pi-bell',
    text: 'Notifications',
    to: '/resident/residentDashboard'
  }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
    <nav class="flex justify-around items-center h-16">
      <router-link 
        v-for="item in navigationItems" 
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-600 hover:text-[#4D5BBF]"
        :class="{ 'text-[#4D5BBF]': $route.path === item.to }"
      >
        <i :class="[item.icon, 'text-xl mb-1']"></i>
        <span class="text-xs">{{ item.text }}</span>
      </router-link>
      
      <!-- Logout Button -->
      <button 
        @click="handleLogout"
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-600 hover:text-red-600"
      >
        <i class="pi pi-sign-out text-xl mb-1"></i>
        <span class="text-xs">Logout</span>
      </button>
    </nav>
  </div>
</template>