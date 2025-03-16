<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const adminLinks = [
  { text: 'Dashboard', to: '/administrator/adminDashboard', icon: 'pi pi-home' },
  { text: 'Profile Management', to: '/administrator/profileManagement', icon: 'pi pi-users' },
  { text: 'Settings', to: '/administrator/settings', icon: 'pi pi-cog' }
]

const managementLinks = [
  { text: 'Dashboard', to: '/management/managementDashboard', icon: 'pi pi-home' },
  { text: 'Residents', to: '/management/residentManagement', icon: 'pi pi-users' },
  { text: 'Residence', to: '/management/facilities', icon: 'pi pi-building' },
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
    <!-- Logo section -->
    <div class="p-4 border-b">
      <img 
        src="@/assets/KitaHome_Logo.png" 
        alt="KitaHome Logo" 
        class="h-8 w-auto"
      />
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto p-4">
      <template v-if="authStore.isAdmin">
        <router-link 
          v-for="(link, index) in adminLinks" 
          :key="index"
          :to="link.to"
          class="flex items-center px-4 py-3 mb-2 rounded-lg text-gray-600 hover:bg-[#4D5BBF] hover:text-white transition-colors"
          :class="{ 'bg-[#4D5BBF] text-white': $route.path === link.to }"
        >
          <i :class="[link.icon, 'mr-3']"></i>
          {{ link.text }}
        </router-link>
      </template>

      <template v-if="authStore.isManagement">
        <router-link 
          v-for="(link, index) in managementLinks" 
          :key="index"
          :to="link.to"
          class="flex items-center px-4 py-3 mb-2 rounded-lg text-gray-600 hover:bg-[#4D5BBF] hover:text-white transition-colors"
          :class="{ 'bg-[#4D5BBF] text-white': $route.path === link.to }"
        >
          <i :class="[link.icon, 'mr-3']"></i>
          {{ link.text }}
        </router-link>
      </template>
    </nav>

    <!-- Logout Button -->
    <div class="p-4 border-t">
      <button 
        @click="handleLogout"
        class="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        <i class="pi pi-sign-out mr-3"></i>
        Logout
      </button>
    </div>
  </div>
</template>