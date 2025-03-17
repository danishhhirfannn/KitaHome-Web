<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import KitaHomeLogo from '@/assets/KitaHome_Logo.png'
import SmallHomeLogo from '@/assets/SmallHome_Logo.png'

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
  { text: 'Residence', to: '/management/facilities', icon: 'pi pi-building' }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const isExpanded = ref(false)

const handleMouseEnter = () => {
  isExpanded.value = true
}

const handleMouseLeave = () => {
  isExpanded.value = false
}
</script>

<template>
  <aside 
    class="hidden lg:block h-screen fixed left-0 top-0 z-20 bg-white border-r border-gray-200"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :data-expanded="isExpanded"
  >
    <div class="flex flex-col h-full w-[70px] hover:w-64 transition-[width] duration-300 group">
      <!-- Logo section -->
      <div class="p-4 border-b flex items-center overflow-hidden whitespace-nowrap">
        <div :class="[
          'flex items-center',
          !isExpanded ? 'justify-center w-full' : ''
        ]">
          <img 
            :src="isExpanded ? KitaHomeLogo : SmallHomeLogo"
            :alt="isExpanded ? 'KitaHome Logo' : 'KH Logo'"
            class="h-8 w-auto flex-shrink-0"
          />
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-hidden hover:overflow-y-auto p-4">
        <template v-if="authStore.isAdmin">
          <div class="mb-6">
            <div class="text-xs uppercase text-gray-400 tracking-wider mb-2 text-center group-hover:text-left">
              <span class="hidden group-hover:inline">Admin</span>
              <span class="group-hover:hidden">A</span>
            </div>
            <div 
              v-for="(link, index) in adminLinks" 
              :key="index"
              @click="router.push(link.to)"
              class="flex items-center p-2 rounded-lg text-gray-600 hover:bg-[#4D5BBF] hover:text-white cursor-pointer mb-1 justify-center group-hover:justify-start"
              :class="{ 'bg-[#4D5BBF] text-white': $route.path === link.to }"
            >
              <i :class="[link.icon, 'text-lg flex-shrink-0']"></i>
              <span class="hidden group-hover:inline ml-3 truncate">{{ link.text }}</span>
            </div>
          </div>
        </template>

        <template v-if="authStore.isManagement">
          <div class="mb-6">
            <div class="text-xs uppercase text-gray-400 tracking-wider mb-2 text-center group-hover:text-left">
              <span class="hidden group-hover:inline">Management</span>
              <span class="group-hover:hidden">M</span>
            </div>
            <div 
              v-for="(link, index) in managementLinks" 
              :key="index"
              @click="router.push(link.to)"
              class="flex items-center p-2 rounded-lg text-gray-600 hover:bg-[#4D5BBF] hover:text-white cursor-pointer mb-1 justify-center group-hover:justify-start"
              :class="{ 'bg-[#4D5BBF] text-white': $route.path === link.to }"
            >
              <i :class="[link.icon, 'text-lg flex-shrink-0']"></i>
              <span class="hidden group-hover:inline ml-3 truncate">{{ link.text }}</span>
            </div>
          </div>
        </template>
      </nav>

      <!-- Logout Button -->
      <div class="p-4 border-t">
        <button 
          @click="handleLogout"
          class="flex items-center w-full p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 justify-center group-hover:justify-start"
        >
          <i class="pi pi-sign-out text-lg flex-shrink-0"></i>
          <span class="hidden group-hover:inline ml-3">Logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.transition-[width] {
  transition-property: width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>