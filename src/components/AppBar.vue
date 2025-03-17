<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'

const authStore = useAuthStore()
const showDropdown = ref(false)
const userData = ref(null)

// Fetch user details from User table
const fetchUserDetails = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('fullName')
      .eq('userID', authStore.user.id)
      .single()

    if (error) throw error
    userData.value = data
    console.log('Fetched user data:', data)
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

// Updated computed properties to use userData
const userInitial = computed(() => {
  return userData.value?.fullName?.charAt(0).toUpperCase() || 'U'
})

const userName = computed(() => {
  return userData.value?.fullName || 'User'
})

const userRole = computed(() => {
  if (authStore.isAdmin) return 'Administrator'
  if (authStore.isManagement) return 'Management'
  return 'Resident'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-profile-container')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  fetchUserDetails()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="w-full bg-white shadow-sm border-b border-gray-200 h-16">
    <div class="h-full px-4 flex items-center justify-end gap-4">
      <!-- Notifications -->
      <button class="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        <i class="pi pi-bell text-gray-600"></i>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- User Profile -->
      <div class="user-profile-container relative">
        <button 
          @click="toggleDropdown"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <!-- User Avatar -->
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            {{ userInitial }}
          </div>

          <!-- User Info -->
          <div class="hidden sm:flex flex-col items-start">
            <p class="text-sm font-medium text-gray-700 leading-tight">
              {{ userName }}
            </p>
            <p class="text-xs text-gray-500 leading-tight">
              {{ userRole }}
            </p>
          </div>

          <!-- Dropdown Arrow -->
          <i class="pi pi-chevron-down text-gray-400 text-xs"></i>
        </button>

        <!-- Dropdown Menu with Animation -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div v-if="showDropdown" 
               class="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div class="py-1">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="pi pi-user mr-2"></i>Profile
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="pi pi-cog mr-2"></i>Settings
              </a>
              <hr class="my-1 border-gray-200">
              <button 
                @click="authStore.logout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <i class="pi pi-power-off mr-2"></i>Logout
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.user-profile-container {
  z-index: 50;
}

/* Add these transition classes */
.transition {
  transition-property: all;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.ease-in {
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-150 {
  transition-duration: 150ms;
}
</style>