<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading submission form...</p>
    </div>

    <!-- Main Content - only show when loading is complete -->
    <div v-else class="content-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-4 pt-7 px-4 slide-in-top">
        <Button 
          icon="pi pi-arrow-left" 
          class="p-button-rounded p-button-plain back-button" 
          @click="goBack"
          aria-label="Go back"
        />
        <div class="flex-1 text-center">
          <h2 class="text-md font-normal text-white tracking-wide">Submit Complaint</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Complaint Submission Form -->
        <div class="p-4 space-y-6 slide-in-left">
          <div class="mb-4">
            <label for="complaintTitle" class="block text-sm font-medium text-gray-700 mb-2">Complaint Title*</label>
            <InputText 
              id="complaintTitle" 
              v-model="complaint.complaintTitle" 
              class="w-full p-inputtext-sm" 
              placeholder="Enter a descriptive title" 
            />
            <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
          </div>

          <div class="mb-4">
            <label for="complaintDescription" class="block text-sm font-medium text-gray-700 mb-2">Description*</label>
            <InputTextarea 
              id="complaintDescription" 
              v-model="complaint.complaintDescription" 
              rows="4" 
              autoResize 
              class="w-full p-inputtext-sm" 
              placeholder="Please provide details about your complaint"
            />
            <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Category*</label>
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="cat in categories" 
                :key="cat.value"
                :class="['px-3 py-2 rounded-full text-sm font-medium cursor-pointer transition-all', 
                  complaint.category === cat.value 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                @click="selectCategory(cat.value)"
              >
                <i :class="['mr-1', cat.icon]"></i>
                {{ cat.label }}
              </div>
            </div>
            <small v-if="errors.category" class="text-red-500">{{ errors.category }}</small>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Photo Evidence (Optional)</label>
            <div class="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerFileInput">
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*" 
                @change="handleImageUpload" 
              />
              <i class="pi pi-image text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-500">Click to upload a photo, or drag and drop</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG or GIF (max. 5MB)</p>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="complaint.complaintImageUrl" class="mb-4">
            <div class="relative rounded-lg overflow-hidden border border-gray-200">
              <img :src="complaint.complaintImageUrl" alt="Selected Image" class="w-full h-48 object-cover" />
              <button 
                class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                @click.prevent="removeSelectedImage"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <Button 
              label="Submit Complaint" 
              icon="pi pi-send" 
              class="w-full text-white"
              @click="submitComplaint"
              :loading="isSubmitting"
            />
          </div>
        </div>
        
        <!-- Add padding at the bottom to prevent overlap with bottom navigation -->
        <div class="pb-16 sm:pb-20"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputTextarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const isLoading = ref(true)
const isSubmitting = ref(false)
const fileInput = ref(null)

// Category options
const categories = [
  { label: "Facility", value: "facility", icon: "pi pi-building" },
  { label: "Security", value: "security", icon: "pi pi-shield" },
  { label: "Neighbor", value: "neighbor", icon: "pi pi-users" },
  { label: "Noise", value: "noise", icon: "pi pi-volume-up" },
  { label: "Maintenance", value: "maintenance", icon: "pi pi-wrench" },
  { label: "Other", value: "other", icon: "pi pi-tag" }
]

// Select category function
const selectCategory = (category) => {
  complaint.value.category = category
}

// Complaint form data
const complaint = ref({
  complaintTitle: '',
  complaintDescription: '',
  complaintImageUrl: null,
  complaintImageFile: null,
  category: null
})

// Form validation
const errors = ref({
  title: '',
  description: '',
  category: ''
})

// Go back function
const goBack = () => {
  router.go(-1)
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value.click()
}

// Handle image selection
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Image size must be less than 5MB',
        life: 3000
      })
      return
    }
    
    // Create preview
    complaint.value.complaintImageFile = file
    complaint.value.complaintImageUrl = URL.createObjectURL(file)
  }
}

// Remove selected image
const removeSelectedImage = () => {
  complaint.value.complaintImageFile = null
  complaint.value.complaintImageUrl = null
}

// Validate form
const validateForm = () => {
  errors.value = {
    title: '',
    description: '',
    category: ''
  }
  
  let isValid = true
  
  if (!complaint.value.complaintTitle.trim()) {
    errors.value.title = 'Please enter a complaint title'
    isValid = false
  }
  
  if (!complaint.value.complaintDescription.trim()) {
    errors.value.description = 'Please provide a description'
    isValid = false
  }
  
  if (!complaint.value.category) {
    errors.value.category = 'Please select a category'
    isValid = false
  }
  
  return isValid
}

// Submit complaint
const submitComplaint = async () => {
  // Validate form first
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }
  
  try {
    isSubmitting.value = true
    
    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    let imageUrl = null
    
    // Upload image if one was selected
    if (complaint.value.complaintImageFile) {
      const fileName = `image/${authUser.id}-${Date.now()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint')
        .upload(fileName, complaint.value.complaintImageFile)
      
      if (uploadError) throw uploadError
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('complaint')
        .getPublicUrl(fileName)
      
      imageUrl = publicUrl
    }
    
    // Create new complaint in the database
    const { data: complaintData, error: complaintError } = await supabase
      .from('Complaint')
      .insert([{
        complaintUserID: authUser.id,
        complaintTitle: complaint.value.complaintTitle,
        complaintDescription: complaint.value.complaintDescription,
        complaintImageUrl: imageUrl,
        isResolved: false,
        isPending: false,
        complaintCategory: complaint.value.category
      }])
      .select()
    
    if (complaintError) throw complaintError
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Complaint submitted successfully',
      life: 3000
    })
    
    // Navigate back to complaints list
    router.push('/resident/complaintManagementResident')
    
  } catch (error) {
    console.error('Error submitting complaint:', error)
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to submit complaint. Please try again.',
      life: 3000
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  // Simulate loading time for a better UX
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})
</script>

<style scoped>
.bg-primary {
  background-color: #4D5BBF;
}

.bg-primary-500 {
  background-color: #4D5BBF;
}

.text-primary {
  color: #4D5BBF;
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

@media (max-width: 640px) {
  .rounded-tl-3xl {
    border-top-left-radius: 20px;
  }

  .rounded-tr-3xl {
    border-top-right-radius: 20px;
  }
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

/* Back Button */
:deep(.back-button) {
  color: white !important;
  background-color: transparent !important;
  border: none !important;
}

:deep(.back-button:hover) {
  background-color: transparent !important;
  color: white !important;
  box-shadow: none !important;
}

:deep(.back-button .pi) {
  font-size: 1.25rem;
}
</style> 