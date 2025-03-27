<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading complaint details...</p>
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
          <h2 class="text-md font-normal text-white tracking-wide">Complaint Details</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Error state -->
        <div v-if="error" class="flex flex-col items-center justify-center py-12">
          <i class="pi pi-exclamation-circle text-red-400 text-5xl mb-4"></i>
          <h4 class="text-gray-700 font-medium text-lg mb-2">{{ error }}</h4>
          <p class="text-gray-500 text-sm text-center max-w-xs mb-6">There was a problem loading this complaint.</p>
          <Button label="Go Back" icon="pi pi-arrow-left" @click="goBack" class="p-button-primary" />
        </div>
        
        <!-- Complaint details -->
        <div v-else-if="complaint" class="slide-in-left space-y-6">
          <!-- Complaint header card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5">
              <div class="flex flex-col">
                <div class="flex items-start justify-between">
                  <div class="flex flex-col">
                    <h2 class="text-lg font-semibold text-gray-800 break-words flex-1">{{ complaint.complaintTitle }}</h2>
                    <span class="text-xs text-gray-500 mt-1">ID: {{ truncateId(complaint.complaintID, true) }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <div :class="[
                      'px-3 py-1.5 rounded-full text-xs font-medium',
                      getStatusClass(complaint)
                    ]">
                      {{ getStatusText(complaint) }}
                    </div>
                    <div class="flex flex-col items-end mt-2 text-xs text-gray-500">
                      <span>{{ new Date(complaint.created_at).toLocaleDateString() }}</span>
                      <span>{{ new Date(complaint.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Responses from management -->
          <Panel header="Responses from Management" :toggleable="true" class="complaint-panel mb-4">
            <div v-if="complaint.complaintFeedbacks && complaint.complaintFeedbacks.length > 0" class="space-y-4">
              <div v-for="feedback in complaint.complaintFeedbacks" :key="feedback.feedbackID" 
                   class="flex gap-3 items-start">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-semibold">
                  S
                </div>
                <div class="flex-1">
                  <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p class="text-sm text-gray-800">{{ feedback.feedbackDescription }}</p>
                  </div>
                  <div class="flex items-center mt-2">
                    <span class="text-xs text-gray-500">
                      Staff
                    </span>
                    <span class="mx-2 text-gray-300">•</span>
                    <span class="text-xs text-gray-500">
                      {{ new Date(feedback.created_at).toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No responses state -->
            <div v-else class="bg-gray-50 p-4 rounded-lg text-center">
              <i class="pi pi-inbox text-gray-300 text-xl mb-2"></i>
              <p class="text-sm text-gray-500">No responses from management yet.</p>
            </div>
          </Panel>
          
          <!-- Description -->
          <Panel header="Description" :toggleable="true" class="complaint-panel mb-4">
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ complaint.complaintDescription }}</p>
          </Panel>
          
          <!-- Complaint image -->
          <Panel v-if="complaint.complaintImageUrl" header="Attachment" :toggleable="true" class="complaint-panel mb-4">
            <div class="bg-gray-50 p-2 rounded-lg inline-block max-w-full">
              <img 
                :src="complaint.complaintImageUrl" 
                alt="Complaint image" 
                class="max-h-80 object-contain rounded complaint-image max-w-full"
                @click="openImagePreview(complaint.complaintImageUrl)"
              />
            </div>
            <div class="mt-2 text-xs text-gray-500 flex items-center">
              <i class="pi pi-search-plus mr-1"></i>
              <span>Click image to enlarge</span>
            </div>
          </Panel>
        </div>
        
        <!-- Add padding at the bottom to prevent overlap with bottom navigation -->
        <div class="pb-24 sm:pb-28"></div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="isImagePreviewVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" @click.self="closeImagePreview">
      <div class="relative bg-white rounded-lg shadow-lg max-w-4xl w-full">
        <button class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all" @click="closeImagePreview">
          <i class="pi pi-times"></i>
        </button>
        <div class="p-2">
          <img :src="previewImageUrl" alt="Image Preview" class="w-full h-auto rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/api/supabase'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isLoading = ref(true)
const complaint = ref(null)
const error = ref(null)

// Image preview state
const isImagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// Function to go back to the previous page
const goBack = () => {
  router.go(-1)
}

// Function to get status text based on isResolved and isPending fields
const getStatusText = (complaint) => {
  if (complaint.isResolved && complaint.isPending) return 'Resolved'
  if (!complaint.isResolved && complaint.isPending) return 'Reviewed'
  return 'Submitted'
}

// Function to get appropriate status class
const getStatusClass = (complaint) => {
  if (complaint.isResolved && complaint.isPending) return 'bg-green-100 text-green-700'
  if (!complaint.isResolved && complaint.isPending) return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}

// Function to truncate complaint ID
const truncateId = (id, showMore = false) => {
  if (!id) return ''
  if (showMore) {
    return id
  }
  if (id.length <= 20) return id
  return id.slice(0, 20) + '...'
}

// Image preview functionality
const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl
  isImagePreviewVisible.value = true
}

const closeImagePreview = () => {
  isImagePreviewVisible.value = false
}

// Fetch complaint data based on ID
onMounted(async () => {
  try {
    isLoading.value = true
    const complaintId = route.params.id
    
    if (!complaintId) {
      throw new Error('No complaint ID provided')
    }
    
    // Fetch complaint data with feedback/responses
    const { data: complaintData, error: complaintError } = await supabase
      .from('Complaint')
      .select(`
        *,
        complaintFeedbacks:Complaint_Feedback(*)
      `)
      .eq('complaintID', complaintId)
      .single()

    if (complaintError) throw complaintError
    
    if (!complaintData) {
      throw new Error('Complaint not found')
    }
    
    // Sort feedback by date (oldest first)
    if (complaintData.complaintFeedbacks) {
      complaintData.complaintFeedbacks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    
    complaint.value = complaintData
    
    // Simulate minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
  } catch (err) {
    console.error('Error fetching complaint:', err)
    error.value = err.message || 'Failed to load complaint details'
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
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

/* Complaint image style */
.complaint-image {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.complaint-image:hover {
  transform: scale(1.01);
  border-color: #4D5BBF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* PrimeVue Panel customization */
:deep(.complaint-panel.p-panel) {
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

:deep(.complaint-panel .p-panel-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  padding: 0.75rem 1.25rem;
}

:deep(.complaint-panel .p-panel-title) {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

:deep(.complaint-panel .p-panel-content) {
  padding: 1.25rem;
  background-color: white;
}

:deep(.complaint-panel .p-panel-icons .p-panel-header-icon) {
  width: 2rem;
  height: 2rem;
  color: #6b7280;
}

:deep(.complaint-panel .p-panel-icons .p-panel-header-icon:hover) {
  background-color: rgba(77, 91, 191, 0.04);
  color: #4D5BBF;
}
</style>