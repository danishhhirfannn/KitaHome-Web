import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userDetails = ref(null)
  const isInitialized = ref(false)
  
  const isAdmin = computed(() => userDetails.value?.isAdmin ?? false)
  const isManagement = computed(() => userDetails.value?.isManagement ?? false)
  const isResident = computed(() => userDetails.value?.isResident ?? false)
  
  async function fetchUserDetails() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        user.value = null
        userDetails.value = null
        return null
      }

      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (error) throw error
      
      user.value = authUser
      userDetails.value = data
      isInitialized.value = true
      return data
    } catch (error) {
      console.error('Error fetching user details:', error)
      return null
    }
  }

  // Initialize auth state
  async function initialize() {
    if (!isInitialized.value) {
      await fetchUserDetails()
    }
    return isInitialized.value
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
      user.value = null
      userDetails.value = null
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return {
    user,
    userDetails,
    isAdmin,
    isManagement,
    isResident,
    isInitialized,
    fetchUserDetails,
    initialize,
    logout
  }
})