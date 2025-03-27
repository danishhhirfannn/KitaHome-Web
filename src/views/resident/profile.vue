<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading your profile...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="content-fade-in">
      <!-- Header Section -->
      <div class="flex items-center mb-4 pt-7 px-4 slide-in-top">
        <Button 
          icon="pi pi-arrow-left" 
          class="mr-3 text-white p-button-text" 
          @click="router.push('/resident/residentDashboard')"
        />
        <div>
          <h2 class="text-sm font-medium text-white">My Profile</h2>
          <p class="text-xs text-gray-200">{{ userData.residenceName }}</p>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Profile Header -->
        <div class="flex flex-col items-center mb-8 slide-in-top">
          <div class="relative">
            <Avatar 
              :image="userData.residencePhoto || userAvatar" 
              class="mr-0 mb-3" 
              size="xlarge" 
              shape="circle"
              :style="{ 
                objectFit: 'cover',
                width: '100px',
                height: '100px'
              }"
              :pt="{
                image: { style: 'object-fit: cover' }
              }"
            />
            <Button 
              icon="pi pi-camera" 
              class="absolute bottom-2 right-0 p-button-rounded p-button-sm bg-primary text-white border-2 border-white"
              @click="handleUploadPhoto"
              aria-label="Upload Photo"
            />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mt-3">{{ userData.fullName }}</h2>
          <p class="text-sm text-gray-500">{{ userData.email }}</p>
          <Tag 
            :value="userData.isVerified ? 'Verified' : 'Pending Verification'" 
            :severity="userData.isVerified ? 'success' : 'warning'"
            class="mt-2"
          />
        </div>

        <!-- Profile Information -->
        <div class="mb-6 slide-in-left" style="animation-delay: 0.2s">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-base font-semibold text-primary">Personal Information</h3>
              <Button 
                icon="pi pi-pencil" 
                outlined 
                size="small" 
                class="p-button-sm" 
                @click="editPersonalInfo = true"
              />
            </div>
            
            <!-- View Mode -->
            <div v-if="!editPersonalInfo" class="p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Full Name</p>
                  <p class="text-sm text-gray-800">{{ userData.fullName }}</p>
                </div>
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Email</p>
                  <p class="text-sm text-gray-800">{{ userData.email }}</p>
                </div>
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Phone</p>
                  <p class="text-sm text-gray-800">{{ userData.phone || 'Not provided' }}</p>
                </div>
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Unit Number</p>
                  <p class="text-sm text-gray-800">{{ userData.unitNumber }}</p>
                </div>
              </div>
            </div>
            
            <!-- Edit Mode -->
            <div v-else class="p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label for="fullName" class="text-xs text-gray-500 mb-1">Full Name</label>
                  <InputText id="fullName" v-model="editForm.fullName" class="p-inputtext-sm w-full" />
                </div>
                <div class="flex flex-col">
                  <label for="email" class="text-xs text-gray-500 mb-1">Email</label>
                  <InputText id="email" v-model="editForm.email" class="p-inputtext-sm w-full" disabled />
                </div>
                <div class="flex flex-col">
                  <label for="phone" class="text-xs text-gray-500 mb-1">Phone</label>
                  <InputText id="phone" v-model="editForm.phone" class="p-inputtext-sm w-full" />
                </div>
                <div class="flex flex-col">
                  <label for="unitNumber" class="text-xs text-gray-500 mb-1">Unit Number</label>
                  <InputText id="unitNumber" v-model="editForm.unitNumber" class="p-inputtext-sm w-full" />
                </div>
              </div>
              <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancel" outlined class="p-button-sm" @click="cancelEdit" />
                <Button label="Save" class="p-button-sm" @click="saveProfileChanges" />
              </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="mb-6 slide-in-left" style="animation-delay: 0.3s">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <h3 class="text-base font-semibold text-primary">Security</h3>
            </div>
            <div class="p-4">
              <Button 
                label="Change Password" 
                icon="pi pi-lock" 
                class="p-button-outlined w-full sm:w-auto"
                @click="showChangePasswordDialog = true"
              />
            </div>
          </div>
        </div>

        <!-- Residence Information -->
        <div class="mb-6 slide-in-left" style="animation-delay: 0.4s">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <h3 class="text-base font-semibold text-primary">Residence Information</h3>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Residence Name</p>
                  <p class="text-sm text-gray-800">{{ userData.residenceName }}</p>
                </div>
                <div class="flex flex-col">
                  <p class="text-xs text-gray-500 mb-1">Unit Number</p>
                  <p class="text-sm text-gray-800">{{ userData.unitNumber }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add padding at the bottom to prevent overlap with bottom navigation -->
        <div class="pb-16 sm:pb-20"></div>
      </div>
    </div>
  </div>

  <!-- Change Password Dialog -->
  <Dialog 
    v-model:visible="showChangePasswordDialog" 
    modal 
    header="Change Password" 
    :style="{width: '30rem'}" 
    :breakpoints="{'960px': '75vw', '641px': '90vw'}"
  >
    <div class="flex flex-col gap-4 p-2">
      <div class="field">
        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
        <Password id="currentPassword" v-model="passwordForm.currentPassword" toggleMask inputClass="w-full" class="w-full" />
      </div>
      <div class="field">
        <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <Password id="newPassword" v-model="passwordForm.newPassword" toggleMask inputClass="w-full" class="w-full" />
      </div>
      <div class="field">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <Password id="confirmPassword" v-model="passwordForm.confirmPassword" toggleMask inputClass="w-full" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" outlined @click="showChangePasswordDialog = false" />
      <Button label="Change Password" @click="changePassword" />
    </template>
  </Dialog>

  <!-- Toast for notifications -->
  <Toast position="top-center" />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import userAvatar from '@/assets/user-avatar.jpg'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(true)
const editPersonalInfo = ref(false)
const showChangePasswordDialog = ref(false)

const userData = ref({
  fullName: 'Loading...',
  email: 'Loading...',
  phone: '',
  residenceName: 'Loading...',
  residencePhoto: null,
  unitNumber: '',
  isVerified: false,
})

const editForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  unitNumber: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Fetch user profile data
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Simulate minimum loading time (at least 1 second)
    const loadingPromise = new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      // Get user details from User table
      const { data: userData1, error: userError } = await supabase
        .from('User')
        .select('userID, isVerified, fullName, email, phone, residenceID, unitNumber')
        .eq('userID', authUser.id)
        .single()
        
      if (userError) throw userError
      
      if (userData1) {
        userData.value.fullName = userData1.fullName
        userData.value.email = authUser.email || ''
        userData.value.phone = userData1.phone || ''
        userData.value.unitNumber = userData1.unitNumber || ''
        userData.value.isVerified = userData1.isVerified
        
        // Initialize edit form
        editForm.fullName = userData1.fullName
        editForm.email = authUser.email || ''
        editForm.phone = userData1.phone || ''
        editForm.unitNumber = userData1.unitNumber || ''
        
        // Get residence details if there's a residenceID
        if (userData1.residenceID) {
          const { data: residenceData, error: residenceError } = await supabase
            .from('Residence')
            .select('residenceName, displayPhotoUrl')
            .eq('residenceID', userData1.residenceID)
            .single()
            
          if (!residenceError && residenceData) {
            userData.value.residenceName = residenceData.residenceName
            userData.value.residencePhoto = residenceData.displayPhotoUrl
          }
        }
      }
    }
    
    // Wait for minimum loading time
    await loadingPromise
    
  } catch (error) {
    console.error('Error fetching profile data:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile information', life: 3000 })
  } finally {
    isLoading.value = false
  }
})

// Cancel edit mode
const cancelEdit = () => {
  editPersonalInfo.value = false
  
  // Reset form to current data
  editForm.fullName = userData.value.fullName
  editForm.phone = userData.value.phone || ''
  editForm.unitNumber = userData.value.unitNumber || ''
}

// Save profile changes
const saveProfileChanges = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
      .update({
        fullName: editForm.fullName,
        phone: editForm.phone,
        unitNumber: editForm.unitNumber
      })
      .eq('userID', authStore.user.id)
    
    if (error) throw error
    
    // Update local state
    userData.value.fullName = editForm.fullName
    userData.value.phone = editForm.phone
    userData.value.unitNumber = editForm.unitNumber
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 })
    editPersonalInfo.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update profile', life: 3000 })
  }
}

// Change password
const changePassword = async () => {
  // Validate passwords
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match', life: 3000 })
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters', life: 3000 })
    return
  }
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    })
    
    if (error) throw error
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 })
    showChangePasswordDialog.value = false
    
    // Reset password form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('Error changing password:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to change password', life: 3000 })
  }
}

// Handle profile photo upload
const handleUploadPhoto = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Photo upload functionality is coming soon', life: 3000 })
}
</script>

<style scoped>
.bg-primary {
  background-color: #4D5BBF;
}

/* Loading animation styles */
.loading-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-logo {
  width: 80px;
  height: 80px;
  z-index: 10;
  object-fit: contain;
}

.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-right: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.rounded-tl-3xl {
  border-top-left-radius: 26px;
}

.rounded-tr-3xl {
  border-top-right-radius: 26px;
}

/* Page transition animations */
.content-fade-in {
  animation: content-fade 0.8s ease-out forwards;
}

.content-scale-in {
  animation: content-scale 0.5s ease-out forwards;
  transform-origin: top center;
}

.slide-in-top {
  animation: slide-in-from-top 0.5s ease-out forwards;
}

.slide-in-left {
  animation: slide-in-from-left 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes content-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes content-scale {
  0% {
    opacity: 0;
    transform: scaleY(0.97);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes slide-in-from-top {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-from-left {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.p-avatar.p-avatar-circle img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.p-avatar.p-avatar-xlarge) {
  width: 100px;
  height: 100px;
}

:deep(.p-button.p-button-text) {
  color: inherit;
}
</style> 