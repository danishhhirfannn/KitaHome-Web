<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading announcements...</p>
    </div>

    <!-- Main Content - only show when loading is complete -->
    <div v-else class="content-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-4 pt-7 px-4 slide-in-top">
        <Button 
          icon="pi pi-arrow-left" 
          class="p-button-rounded p-button-plain back-button" 
          @click="router.go(-1)"
          aria-label="Go back"
        />
        <div class="flex-1 text-center">
          <h2 class="text-md font-normal text-white tracking-wide">Announcements</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Error state -->
        <div v-if="error" class="flex flex-col items-center justify-center py-12 slide-in-left">
          <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
          <p class="text-gray-700 mb-2">{{ error }}</p>
          <Button label="Try Again" @click="fetchAnnouncements" class="mt-4" />
        </div>

        <!-- Empty state -->
        <div v-else-if="announcements.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
          <i class="pi pi-info-circle text-5xl text-primary mb-4"></i>
          <p class="text-gray-700 mb-2">No announcements available</p>
          <p class="text-gray-500 text-sm text-center">There are currently no announcements for your residence.</p>
        </div>

        <!-- Announcements List -->
        <div v-else class="grid grid-cols-1 gap-4 slide-in-left">
          <div v-for="announcement in announcements" :key="announcement.id" 
               class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
               @click="viewAnnouncementDetails(announcement)"
               style="cursor: pointer;">
            <div class="relative">
              <div class="w-full h-28 relative">
                <img :src="residencePhoto || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop'" 
                     :alt="announcement.title" 
                     class="w-full h-40 object-cover rounded-lg blur-[1px] brightness-[0.8]" />
                <div class="absolute inset-0 bg-black/40 rounded-lg"></div>
              </div>
              
              <div class="absolute bottom-0 left-0 right-0 p-4">
                <div class="flex justify-between items-center">
                  <h4 class="text-sm sm:text-base text-white font-medium">{{ announcement.title }}</h4>
                  <span class="text-[10px] text-white bg-primary/60 px-2 py-0.5 rounded-full">{{ announcement.date }}</span>
                </div>
                <div class="flex items-center mt-0.5">
                  <p class="text-xs font-light text-gray-100">By {{ announcement.author }}</p>
                  <div v-if="announcement.attachmentUrl" class="flex items-center ml-2">
                    <i class="pi pi-paperclip text-white text-[10px]"></i>
                  </div>
                </div>
                <p class="text-xs text-white mt-2 line-clamp-2">{{ announcement.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Announcement Details Dialog -->
  <Dialog 
    v-model:visible="announcementDialog" 
    :modal="true"
    :header="false"
    :showHeader="false"
    :style="{width: '35rem', maxWidth: '95vw'}"
    :breakpoints="{'960px': '90vw', '640px': '95vw'}"
    class="shadow-xl rounded-lg overflow-hidden announcement-dialog"
    :closable="true"
  >
    <div v-if="selectedAnnouncement" class="p-0">
      <!-- Header with close button -->
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">Announcement</h3>
        <Button 
          icon="pi pi-times" 
          class="p-button-rounded p-button-text p-button-sm" 
          @click="announcementDialog = false"
          aria-label="Close" 
        />
      </div>
      
      <!-- Post header with author info -->
      <div class="p-4 flex items-center">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg">
          {{ selectedAnnouncement.author.charAt(0).toUpperCase() }}
        </div>
        <div class="ml-3">
          <p class="font-medium text-gray-800">{{ selectedAnnouncement.author }}</p>
          <p class="text-xs text-gray-500 flex items-center">
            {{ selectedAnnouncement.date }}
          </p>
        </div>
      </div>
      
      <!-- Post title and content -->
      <div class="px-4 py-2">
        <h1 class="text-lg font-semibold text-gray-900 mb-3">{{ selectedAnnouncement.title }}</h1>
        <p class="text-gray-700 whitespace-pre-wrap mb-4">{{ selectedAnnouncement.description }}</p>
      </div>
      
      <!-- Attachment Section (if available) -->
      <div v-if="selectedAnnouncement.attachmentUrl" class="px-4 pb-4">
        <!-- Preview for image attachments -->
        <div v-if="isImageAttachment(selectedAnnouncement.attachmentUrl)" class="border border-gray-200 rounded-lg overflow-hidden mb-2">
          <img :src="selectedAnnouncement.attachmentUrl" alt="Attachment" class="max-h-80 object-contain w-full" />
        </div>
        <!-- Non-image attachment -->
        <div v-else class="border border-gray-200 rounded-lg p-4 flex items-center">
          <div class="rounded-full bg-gray-100 w-10 h-10 flex items-center justify-center mr-3">
            <i class="pi pi-file text-primary-600 text-lg"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-700">Document Attachment</p>
            <p class="text-xs text-gray-500">Click to download</p>
          </div>
          <Button
            icon="pi pi-download"
            class="p-button-rounded p-button-text"
            @click="window.open(selectedAnnouncement.attachmentUrl, '_blank')"
            aria-label="Download"
          />
        </div>
      </div>
      
      <!-- Footer with interaction buttons -->
      <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
        <Button 
          label="Download" 
          v-if="selectedAnnouncement.attachmentUrl"
          icon="pi pi-download" 
          class="p-button-text p-button-sm"
          @click="window.open(selectedAnnouncement.attachmentUrl, '_blank')"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)
const announcements = ref([])
const announcementDialog = ref(false)
const selectedAnnouncement = ref(null)
const residencePhoto = ref(null)

onMounted(async () => {
  await fetchUserData()
  await fetchAnnouncements()
})

// Fetch user data to get residence photo
const fetchUserData = async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('userID, residenceID')
        .eq('userID', authUser.id)
        .single()
        
      if (userError) throw userError
      
      if (userData && userData.residenceID) {
        // Get residence details
        const { data: residenceData, error: residenceError } = await supabase
          .from('Residence')
          .select('displayPhotoUrl')
          .eq('residenceID', userData.residenceID)
          .single()
          
        if (!residenceError && residenceData) {
          residencePhoto.value = residenceData.displayPhotoUrl
        }
      }
    }
  } catch (err) {
    console.error('Error fetching user data:', err)
  }
}

// Function to fetch announcements
const fetchAnnouncements = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('Announcement')
      .select(`
        announcementID,
        announcementTitle,
        announcementDescription,
        announcementStatus,
        announcementVisibility,
        announcementAttachmentUrl,
        announcementUserID,
        created_at,
        User(fullName)
      `)
      .eq('announcementStatus', 'Published')
      .eq('announcementVisibility', 'Public')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    if (data) {
      announcements.value = data.map(announcement => {
        // Format the date
        const date = new Date(announcement.created_at)
        const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
        
        return {
          id: announcement.announcementID,
          title: announcement.announcementTitle,
          description: announcement.announcementDescription,
          author: announcement.User?.fullName || 'Admin',
          date: formattedDate,
          attachmentUrl: announcement.announcementAttachmentUrl
        }
      })
    }
  } catch (err) {
    console.error('Error fetching announcements:', err)
    error.value = 'Could not load announcements. Please try again.'
  } finally {
    loading.value = false
  }
}

// Function to view announcement details
const viewAnnouncementDetails = (announcement) => {
  selectedAnnouncement.value = announcement
  announcementDialog.value = true
}

// Function to check if the attachment is an image
const isImageAttachment = (url) => {
  if (!url) return false
  
  const extension = url.split('.').pop()?.toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(extension)
}
</script>

<style scoped>
.bg-primary {
  background-color: #4D5BBF;
}

.rounded-tl-3xl {
  border-top-left-radius: 26px;
}

.rounded-tr-3xl {
  border-top-right-radius: 26px;
}

:deep(.p-button.p-button-white .pi) {
  color: white;
}

:deep(.p-button.p-button-white:hover) {
  background: rgba(255, 255, 255, 0.1);
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

/* Announcement dialog styles */
:deep(.announcement-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.announcement-dialog .p-dialog-content) {
  padding: 0;
}

:deep(.announcement-dialog .p-dialog-header) {
  display: none;
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

.text-primary {
  color: #4D5BBF;
}
</style>