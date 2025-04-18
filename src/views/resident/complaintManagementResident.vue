<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading your complaints...</p>
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
          <h2 class="text-md font-normal text-white tracking-wide">Complaints</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Tab Navigation -->
        <Tabs v-model:value="activeTabIndex" class="mb-6">
          <TabList>
            <Tab value="0">Active Complaints</Tab>
            <Tab value="1">Complaint History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0" class="tab-panel">
              <!-- Empty state -->
              <div v-if="activeComplaints.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
                <i class="pi pi-check-circle text-gray-300 text-5xl mb-4"></i>
                <h4 class="text-gray-500 font-medium text-sm mb-2">No active complaints</h4>
                <p class="text-gray-400 text-xs text-center max-w-xs">You have no active complaints at this time.</p>
              </div>
              
              <!-- Active Complaints List -->
              <div v-else class="space-y-3 slide-in-left">
                <div v-for="complaint in activeComplaints" :key="complaint.complaintID" 
                     class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden complaint-card cursor-pointer"
                     @click="navigateToDetails(complaint.complaintID)">
                  <div class="flex flex-col h-full">
                    <div class="flex items-center px-4 py-3 border-b border-gray-100">
                      <i class="pi pi-exclamation-circle mr-2 text-primary"></i>
                      <span class="text-xs font-medium tracking-wide text-primary truncate max-w-[180px]">{{ truncateId(complaint.complaintID) }}</span>
                      <div :class="[
                        'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium',
                        getStatusClass(complaint)
                      ]">
                        {{ getStatusText(complaint) }}
                      </div>
                    </div>
                    <div class="p-4 flex-grow">
                      <h4 class="text-sm font-semibold text-gray-800 mb-1">{{ complaint.complaintTitle }}</h4>
                      <p class="text-xs text-gray-600 mb-3 line-clamp-3">{{ complaint.complaintDescription }}</p>
                      
                      <!-- Display image if available -->
                      <div v-if="complaint.complaintImageUrl" class="mb-3">
                        <img 
                          :src="complaint.complaintImageUrl" 
                          alt="Complaint image" 
                          class="w-full h-32 object-cover rounded-lg shadow-sm complaint-image"
                          @click="openImagePreview(complaint.complaintImageUrl)"
                        />
                      </div>
                      
                      <div class="flex justify-between items-center mt-auto">
                        <span class="text-xs text-gray-500 font-light">{{ new Date(complaint.created_at).toLocaleDateString() }}</span>
                        <Button label="View Details" class="text-xs" text @click="navigateToDetails(complaint.complaintID)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="1" class="tab-panel">
              <!-- Empty state -->
              <div v-if="complaintHistory.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
                <i class="pi pi-history text-gray-300 text-5xl mb-4"></i>
                <h4 class="text-gray-500 font-medium text-sm mb-2">No complaint history</h4>
                <p class="text-gray-400 text-xs text-center max-w-xs">Your complaint history will appear here.</p>
              </div>
              
              <!-- Complaint History List -->
              <div v-else class="space-y-3 slide-in-left">
                <div v-for="complaint in complaintHistory" :key="complaint.complaintID" 
                     class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden complaint-card cursor-pointer"
                     @click="navigateToDetails(complaint.complaintID)">
                  <div class="flex flex-col h-full">
                    <div class="flex items-center px-4 py-3 border-b border-gray-100">
                      <i class="pi pi-exclamation-circle mr-2 text-primary"></i>
                      <span class="text-xs font-medium tracking-wide text-primary truncate max-w-[180px]">{{ truncateId(complaint.complaintID) }}</span>
                      <div :class="[
                        'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium',
                        getStatusClass(complaint)
                      ]">
                        {{ getStatusText(complaint) }}
                      </div>
                    </div>
                    <div class="p-4 flex-grow">
                      <h4 class="text-sm font-semibold text-gray-800 mb-1">{{ complaint.complaintTitle }}</h4>
                      <p class="text-xs text-gray-600 mb-3 line-clamp-3">{{ complaint.complaintDescription }}</p>
                      
                      <!-- Display image if available -->
                      <div v-if="complaint.complaintImageUrl" class="mb-3">
                        <img 
                          :src="complaint.complaintImageUrl" 
                          alt="Complaint image" 
                          class="w-full h-32 object-cover rounded-lg shadow-sm complaint-image"
                          @click="openImagePreview(complaint.complaintImageUrl)"
                        />
                      </div>
                      
                      <div class="flex justify-between items-center mt-auto">
                        <span class="text-xs text-gray-500 font-light">{{ new Date(complaint.created_at).toLocaleDateString() }}</span>
                        <Button label="View Details" class="text-xs" text @click="navigateToDetails(complaint.complaintID)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <!-- Add padding at the bottom to prevent overlap with bottom navigation -->
        <div class="pb-16 sm:pb-20"></div>
      </div>

      <!-- Floating Action Button -->
      <Button 
        icon="pi pi-plus" 
        class="p-button-rounded p-button-primary fab-button" 
        @click="createNewComplaint"
        aria-label="Create new complaint"
      />
    </div>

    <!-- Image Preview Modal -->
    <div v-if="isImagePreviewVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" @click.self="closeImagePreview">
      <div class="relative bg-white rounded-lg shadow-lg max-w-2xl w-full">
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
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const isLoading = ref(true)
const activeTabIndex = ref('0')

const activeComplaints = ref([])
const complaintHistory = ref([])

// Function to go back to the previous page
const goBack = () => {
  router.go(-1)
}

// Function to navigate to complaint details
const navigateToDetails = (complaintId) => {
  router.push({ name: 'complaint-details', params: { id: complaintId } })
}

// Fetch complaints data
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Get user from auth store
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) throw authError
    
    if (!authUser) {
      throw new Error('No authenticated user found')
    }
    
    // Fetch complaints for the user
    const { data: complaintData, error: complaintError } = await supabase
      .from('Complaint')
      .select('*')
      .eq('complaintUserID', authUser.id)
      .order('created_at', { ascending: false })

    if (complaintError) throw complaintError

    if (complaintData) {
      // Separate active and historical complaints
      activeComplaints.value = complaintData.filter(complaint => !complaint.isResolved)
      complaintHistory.value = complaintData.filter(complaint => complaint.isResolved)
    }
    
    // Simulate minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
    console.error('Error fetching data:', error)
    let errorMessage = 'Could not load complaints'
    
    if (error.message === 'No authenticated user found') {
      errorMessage = 'Please log in to view your complaints'
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
})

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
const truncateId = (id) => {
  if (!id) return ''
  if (id.length <= 20) return id
  return id.slice(0, 20) + '...'
}

// Image preview functionality
const isImagePreviewVisible = ref(false)
const previewImageUrl = ref('')

// Function to handle creating new complaint
const createNewComplaint = () => {
  router.push('/resident/submitComplaint')
}

const openImagePreview = (imageUrl, event) => {
  // Prevent the click from propagating to the parent card
  if (event) {
    event.stopPropagation()
  }
  previewImageUrl.value = imageUrl
  isImagePreviewVisible.value = true
}

const closeImagePreview = () => {
  isImagePreviewVisible.value = false
}
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

/* Tabs component styling */
:deep(.p-tablist-tab-list) {
  border: none;
  background: transparent;
  display: flex;
  width: 100%;
  justify-content: center;
  position: relative;
  gap: 0;
}

:deep(.p-tab) {
  color: #4D5BBF;
  background: white;
  border: none;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  flex: 1;
  max-width: 150px;
}

@media (max-width: 640px) {
  :deep(.p-tab) {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
    max-width: none;
  }
}

:deep(.p-tab-active) {
  color: #4D5BBF;
  font-weight: 600;
}

:deep(.p-tablist-active-bar) {
  height: 2px;
  background-color: #4D5BBF;
  bottom: 0;
  position: absolute;
  transition: all 0.2s ease;
}

:deep(.p-tabs .p-tabpanels) {
  background: transparent;
  border: none;
  padding: 1.25rem 0;
}

:deep(.p-tab:hover:not(.p-tab-active)) {
  background: rgba(77, 91, 191, 0.04);
  color: #4D5BBF;
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

/* Tab Panel Animations */
.tab-panel {
  position: relative;
  overflow: hidden;
}

/* Tab transition styles */
:deep(.p-tabpanels) {
  position: relative;
  overflow: hidden;
}

:deep(.p-tabpanel) {
  transition: all 0.3s ease-in-out;
}

:deep(.p-tabpanel.p-tabpanel-active) {
  animation: tab-fade-in 0.3s ease-in-out forwards;
}

@keyframes tab-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Tab header transition */
:deep(.p-tab) {
  transition: all 0.2s ease-in-out;
}

:deep(.p-tab:hover:not(.p-tab-active)) {
  background: rgba(77, 91, 191, 0.04);
  transform: translateY(-1px);
}

:deep(.p-tab-active) {
  transform: translateY(-1px);
}

/* Active bar animation */
:deep(.p-tablist-active-bar) {
  transition: all 0.3s ease-in-out;
}

/* Floating Action Button */
.fab-button {
  position: fixed !important;
  bottom: 10rem !important;
  right: 2rem !important;
  width: 3.5rem !important;
  height: 3.5rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
}

.fab-button:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.fab-button .pi {
  font-size: 1.5rem !important;
}

@media (max-width: 640px) {
  .fab-button {
    bottom: 5.5rem !important;
    right: 1.5rem !important;
    width: 3rem !important;
    height: 3rem !important;
  }
}

/* Add the complaint card style */
.complaint-card {
  transition: all 0.2s ease;
}

.complaint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Add line clamp utility class */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* Complaint Dialog Styling */
:deep(.p-dialog-header) {
  @apply bg-primary-50 border-b border-primary-100 px-6 py-4;
}

:deep(.p-dialog-title) {
  @apply text-lg font-semibold text-primary-700;
}

:deep(.p-dialog-content) {
  @apply p-0;
}

:deep(.p-dialog-footer) {
  @apply p-4 bg-gray-50 border-t border-gray-100;
}

/* Dialog animations */
:deep(.p-dialog-enter-active) {
  transition: all 0.3s ease-out;
}

:deep(.p-dialog-leave-active) {
  transition: all 0.2s ease-in;
}

:deep(.p-dialog-enter-from),
:deep(.p-dialog-leave-to) {
  opacity: 0;
  transform: translateY(-20px);
}
</style>