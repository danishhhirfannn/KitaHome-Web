<template>
  <div class="animated-gradient min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    <!-- Logo section above the form -->
    <div class="mb-8 sm:mb-10">
      <img 
        src="../assets/KitaHome_Logo.png" 
        alt="KitaHome Logo" 
        class="w-48 sm:w-56 md:w-64 lg:w-72 h-auto object-contain filter drop-shadow-lg"
      />
    </div>

    <!-- Form container -->
    <div class="max-w-md w-full space-y-4 sm:space-y-6 p-4 sm:p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
      <div class="text-left space-y-1 sm:space-y-2">
        <h2 class="text-2xl sm:text-3xl font-bold text-[#232959]">Welcome Back</h2>
        <p class="text-sm sm:text-base font-medium text-[#71717a]">Please enter your details</p>
      </div>
      <form class="mt-4 sm:mt-6 space-y-4 sm:space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-[#3f3f46]">Email</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              required 
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-[#e4e4e7] placeholder-[#71717a] text-[#27272a] focus:outline-none focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-[#3f3f46]">Password</label>
            <div class="mt-1 relative">
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-[#e4e4e7] placeholder-[#71717a] text-[#27272a] focus:outline-none focus:ring-[#4D5BBF] focus:border-[#4D5BBF]"
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword" 
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              class="h-4 w-4 text-[#4D5BBF] focus:ring-[#4D5BBF] border-[#e4e4e7] rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-[#3f3f46]">Remember me</label>
          </div>
          <a href="#" class="text-sm text-[#4D5BBF] hover:text-[#3e49a3]">Forgot password?</a>
        </div>

        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4D5BBF] hover:bg-[#3e49a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D5BBF]"
            :disabled="loading"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>
        </div>
      </form>
      <div v-if="errorMsg" class="mt-4 text-sm text-red-600 text-center">
        {{ errorMsg }}
      </div>
      <div class="text-center text-sm">
        <router-link to="/signup" class="font-medium text-[#4D5BBF] hover:text-[#3e49a3]">
          Don't have an account? Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'  // Add this import
import { ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    errorMsg.value = ''

    // Authenticate with Supabase
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) throw authError

    // Wait for user details to be fetched and initialized
    const userData = await authStore.fetchUserDetails()
    
    if (!userData) throw new Error('Failed to fetch user details')

    // Redirect based on role
    if (userData.isAdmin) {
      await router.push('/administrator/adminDashboard')
    } else if (userData.isManagement) {
      await router.push('/management/managementDashboard')
    } else if (userData.isResident) {
      await router.push('/resident/residentDashboard')
    } else {
      throw new Error('No valid role assigned to this account.')
    }

  } catch (error) {
    errorMsg.value = error.message || 'An error occurred during login.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(
    -45deg,
    #4D5BBF,
    #7683cd,
    #3e49a3,
    #333c87
  );
  background-size: 400% 400%;
  animation: gradient 8s ease infinite;
  position: relative;
  min-height: 100vh; /* Ensure full height on mobile */
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.animated-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3 7-7s-3.134-7-7-7-7 3-7 7 3.134 7 7 7zm48 25c3.866 0 7-3 7-7s-3.134-7-7-7-7 3-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 1.343 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.3;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (max-width: 640px) {
  .animated-gradient::before {
    opacity: 0.2; /* Slightly reduce pattern opacity on mobile */
  }
}
</style>