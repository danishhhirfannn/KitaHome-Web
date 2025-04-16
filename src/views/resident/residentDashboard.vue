<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading your dashboard...</p>
    </div>

    <!-- Main Content - only show when loading is complete -->
    <div v-else class="content-fade-in">
      <!-- Header Section -->
      <div class="flex items-center mb-4 pt-1 px-4 slide-in-top">
        <Avatar 
          :image="userData.residencePhoto || userAvatar" 
          class="mr-3" 
          size="large" 
          shape="circle"
          :style="{ 
            objectFit: 'cover',
            width: '34px',
            height: '34px'
          }"
          :pt="{
            image: { style: 'object-fit: cover' }
          }"
        />
        <div>
          <h2 class="text-sm font-medium text-white">{{ userData.fullName }}</h2>
          <p class="text-xs text-gray-200">{{ userData.residenceName }}</p>
        </div>
        <Button icon="pi pi-bars" class="ml-auto" @click="toggleMenu" />
        <Menu ref="menuRef" :model="menuItems" :popup="true" />
      </div>

      <!-- Content Section -->
      <!-- Verification Status Check -->
      <div v-if="!isVerified" class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg flex flex-col items-center justify-center content-scale-in">
        <div class="verification-pending w-full max-w-lg animation-fade-in p-8 relative bg-white rounded-xl">
          <div class="flex flex-col items-center text-center">
            <div class="verification-icon-container mb-6">
              <i class="pi pi-clock text-4xl text-primary"></i>
              <div class="verification-pulse"></div>
            </div>
            <h2 class="text-2xl font-bold text-primary mb-4">Verification Pending</h2>
            <p class="text-gray-600 mb-6">
              Your identity is currently under verification by the residence administrator.
              This process typically takes 24-48 hours.
            </p>
            <p class="text-gray-500 text-sm">
              Please check back later or contact the management office if verification takes longer than expected.
            </p>
            <Button label="Contact Management" icon="pi pi-envelope" class="mt-8 p-button-outlined" />
          </div>
        </div>
      </div>

      <!-- Regular Content for Verified Users -->
      <div v-else class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Upcoming Payment Section -->
        <div class="flex justify-between items-center mb-3 slide-in-left" style="animation-delay: 0.1s">
          <h3 class="text-base sm:text-lg font-semibold text-primary">Upcoming Payment</h3>
          <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1" @click="router.push('/resident/financialManagementResident')" style="cursor: pointer;">
            View All
            <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
          </div>
        </div>
        <div class="mb-6 slide-in-left" style="animation-delay: 0.2s">
          <!-- Regular payment card for pending payments -->
          <div v-if="hasUpcomingPayment" 
               class="bg-primary rounded-xl shadow-sm overflow-hidden complaint-card" 
               @click="router.push('/resident/financialManagementResident')" 
               style="cursor: pointer;">
            <div class="p-4">
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-start sm:items-center w-full flex-wrap sm:flex-nowrap">
                  <h4 class="text-sm sm:text-base text-white font-medium sm:mb-0 tracking-wide">{{ upcomingPayment.title }}</h4>
                  <div class="px-3 sm:px-4 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs flex items-center gap-2 sm:gap-2">
                    <i class="pi pi-clock" style="font-size: 10px"></i>
                    {{ upcomingPayment.dueIn }}
                  </div>
                </div>
                <div class="flex justify-between items-end w-full">
                  <p class="text-xs font-light sm:text-sm text-white/80 max-w-[60%] line-clamp-3 tracking-normal pb-1">{{ upcomingPayment.description }}</p>
                  <p class="text-xl text-white sm:text-xl font-medium tracking-wide">{{ upcomingPayment.amount }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Alternative card for when no payments are pending -->
          <div v-else
               class="bg-primary rounded-xl shadow-sm overflow-hidden complaint-card relative" 
               @click="router.push('/resident/financialManagementResident')" 
               style="cursor: pointer;">
            <!-- Floating bubbles background -->
            <div class="bubbles-container absolute inset-0 overflow-hidden">
              <div class="bubble bubble-1"></div>
              <div class="bubble bubble-2"></div>
              <div class="bubble bubble-3"></div>
              <div class="bubble bubble-4"></div>
              <div class="bubble bubble-5"></div>
            </div>
            <div class="p-4 relative z-10">
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-start sm:items-center w-full flex-wrap sm:flex-nowrap">
                  <h4 class="text-sm sm:text-base text-white font-medium sm:mb-0 tracking-wide">All Payments Up To Date</h4>
                  <div class="px-3 sm:px-4 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs flex items-center gap-2 sm:gap-2">
                    <i class="pi pi-check-circle" style="font-size: 10px"></i>
                    Completed
                  </div>
                </div>
                <div class="flex justify-between items-end w-full">
                  <p class="text-xs font-light sm:text-sm text-white/80 max-w-[80%] line-clamp-3 tracking-normal pb-1">Your account is in good standing. There are no pending payments at this time.</p>
                  <div class="rounded-full bg-white/20 h-12 w-12 flex items-center justify-center">
                    <i class="pi pi-thumbs-up text-white text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6 slide-in-left" style="animation-delay: 0.3s">
          <div v-for="(action, index) in quickActions" :key="action.title" 
               class="flex flex-col items-center gap-1 sm:gap-2 action-item"
               :style="{ 'animation-delay': `${0.3 + (index * 0.1)}s` }">
            <Button 
              :icon="action.icon"
              class="p-button-rounded p-button-outlined quick-action-btn shadow-[0_1px_12px_0_rgba(0,0,0,0.1)]"
              @click="handleQuickAction(action.type)"
              aria-label="Quick Action" />
            <p class="text-xs sm:text-sm font-medium text-primary text-center">{{ action.title }}</p>
          </div>
        </div>

        <!-- Announcements Section -->
        <div class="flex justify-between items-center mb-3 slide-in-left" style="animation-delay: 0.5s">
          <h3 class="text-base sm:text-lg font-semibold text-primary">Announcements</h3>
          <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1" 
               @click="router.push('/resident/announcements')" 
               style="cursor: pointer;">
            View All
            <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
          </div>
        </div>
        <div class="mb-2 slide-in-left overflow-hidden rounded-lg" style="animation-delay: 0.6s">
          <Carousel 
            :value="announcements" 
            :numVisible="1" 
            :numScroll="1" 
            :circular="true"
            :showNavigators="false"
            :showIndicators="false"
            v-model:activeIndex="currentAnnouncementIndex"
            :autoplayInterval="5000"
            class="announcement-carousel"
          >
            <template #item="slotProps">
              <div class="relative" @click="viewAnnouncementDetails(slotProps.data)" style="cursor: pointer;">
                <div class="w-full h-28 relative">
                  <img :src="userData.residencePhoto || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop'" :alt="slotProps.data.title" class="w-full h-40 object-cover rounded-lg blur-[1px] brightness-[0.8]" />
                  <div class="absolute inset-0 bg-black/40 rounded-lg"></div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-sm sm:text-base text-white font-medium">{{ slotProps.data.title }}</h4>
                    <span class="text-[10px] text-white bg-primary/60 px-2 py-0.5 rounded-full">{{ slotProps.data.date }}</span>
                  </div>
                  <p class="text-xs font-light text-gray-100">By {{ slotProps.data.author }}</p>
                  <p class="text-xs text-white mt-2 line-clamp-2">{{ slotProps.data.description }}</p>
                </div>
              </div>
            </template>
          </Carousel>
        </div>
        
        <!-- Custom Indicators -->
        <div class="custom-indicators flex justify-center gap-1 mb-6 slide-in-left" style="animation-delay: 0.6s">
          <div v-for="(_, i) in announcements" :key="i" 
                :class="['indicator-dot', i === currentAnnouncementIndex ? 'active' : '']"
                @click="currentAnnouncementIndex = i"></div>
        </div>

        <!-- Complaints Archive Section -->
        <div class="flex justify-between items-center mb-3 slide-in-left" style="animation-delay: 0.7s">
          <h3 class="text-base sm:text-lg font-semibold text-primary">Complaints Archive</h3>
          <div label="View All" link class="text-primary-500 text-xs sm:text-sm flex items-center group gap-1" 
               @click="router.push('/resident/complaintManagementResident')" 
               style="cursor: pointer;">
            View All
            <i class="pi pi-chevron-right sm:text-xs transition-transform group-hover:translate-x-0.5" style="font-size: 14px"></i>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 slide-in-left" style="animation-delay: 0.8s">
          <div v-for="complaint in complaints" :key="complaint.id" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden complaint-card"
               @click="complaint.id !== 'No complaints' && complaint.id !== 'Error' ? router.push(`/resident/complaintDetails/${complaint.id}`) : null" 
               :style="{ cursor: complaint.id !== 'No complaints' && complaint.id !== 'Error' ? 'pointer' : 'default' }">
            <div class="flex flex-col h-full">
              <div class="flex items-center px-4 py-3 border-b border-gray-100">
                <i class="pi pi-exclamation-circle mr-2 text-primary"></i>
                <span class="text-xs font-medium tracking-wide text-primary truncate max-w-[180px]">{{ truncateId(complaint.id) }}</span>
                <div :class="[
                  'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium',
                  complaint.id === 'No complaints' ? 'bg-gray-100 text-gray-500' :
                  complaint.id === 'Error' ? 'bg-red-100 text-red-700' :
                  getStatusClass(complaint)
                ]">
                  {{ complaint.status }}
                </div>
              </div>
              <div class="p-4 flex-grow">
                <h4 class="text-sm font-semibold text-gray-800 mb-1">{{ complaint.title }}</h4>
                <p class="text-xs text-gray-600 mb-3 line-clamp-3">{{ complaint.description }}</p>
                <div class="flex items-center mt-auto text-xs text-gray-500 font-light">
                  <span>{{ complaint.submittedOn }}</span>
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

  <ConfirmDialog />
  
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import userAvatar from '@/assets/user-avatar.jpg'
import SmallHomeLogo from '@/assets/SmallHome_Logo.png' // Add logo import
import Carousel from 'primevue/carousel'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu' // Add Menu import

const authStore = useAuthStore()
const isVerified = ref(false)
const isLoading = ref(true)

const userData = ref({
  fullName: 'Loading...',
  residenceName: 'Loading...',
  residencePhoto: null,
  unitNumber: ''
})

// Compute if there's an upcoming payment
const hasUpcomingPayment = computed(() => {
  return upcomingPayment.value.title !== 'No Upcoming Payments' && 
         upcomingPayment.value.amount !== 'RM 0.00' &&
         upcomingPayment.value.title !== 'Error Loading Payments';
})

// Fetch user verification status and user data
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Simulate minimum loading time (at least 2 seconds)
    const loadingPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      // Get user details
      const { data: userData1, error: userError } = await supabase
        .from('User')
        .select('userID, isVerified, fullName, residenceID, unitNumber')
        .eq('userID', authUser.id)
        .single()
        
      if (userError) throw userError
      
      if (userData1) {
        isVerified.value = userData1.isVerified
        userData.value.fullName = userData1.fullName
        userData.value.unitNumber = userData1.unitNumber
        
        // Get residence details
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
        
        // Fetch upcoming payments
        await fetchUpcomingPayments(userData1.userID)
        
        // Fetch user complaints
        await fetchUserComplaints(userData1.userID)
      }
    }
    
    // Fetch announcements
    await fetchAnnouncements()
    
    // Wait for both the API calls and minimum loading time
    await loadingPromise;
    
  } catch (error) {
    console.error('Error fetching user data:', error)
  } finally {
    isLoading.value = false
  }
})

const user = ref({
  name: 'Lucas Lim Weng Kit',
  residence: 'Victoria Heights Residence',
  avatar: userAvatar  // Update this line
})

const quickActions = ref([
  { title: 'Finance', icon: 'pi pi-dollar', type: 'finance' },
  { title: 'Complaint', icon: 'pi pi-comments', type: 'complaint' },
  { title: 'Message', icon: 'pi pi-envelope', type: 'message' }
])

// Replacing the static upcomingPayment ref with a function to fetch from db
const upcomingPayment = ref({
  title: 'Loading...',
  description: 'Loading payment details...',
  dueIn: '-',
  amount: '-'
})

// Function to fetch and calculate upcoming payments
const fetchUpcomingPayments = async (userId) => {
  try {
    const today = new Date()
    
    // Fetch the next upcoming invoice that is not paid
    // ordering by invoiceDueAt in ascending order ensures we get the nearest due date first
    // then limiting to 1 result gives us only the invoice with the nearest upcoming due date
    const { data, error } = await supabase
      .from('Invoice')
      .select('invoiceID, invoiceTitle, invoiceDescription, invoiceAmount, invoiceDueAt, isPaid')
      .eq('invoiceUserID', userId)
      .eq('isPaid', false)
      .order('invoiceDueAt', { ascending: true }) // Sort by nearest due date first
      .limit(1) // Get only the single nearest invoice
    
    if (error) throw error
    
    if (data && data.length > 0) {
      const invoice = data[0]
      
      // Calculate days until due
      const dueDate = new Date(invoice.invoiceDueAt)
      const diffTime = Math.abs(dueDate - today)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Format amount to include currency
      const formattedAmount = new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR'
      }).format(invoice.invoiceAmount)
      
      upcomingPayment.value = {
        title: invoice.invoiceTitle,
        description: invoice.invoiceDescription,
        dueIn: diffDays <= 1 ? 'Today' : `${diffDays} days`,
        amount: formattedAmount
      }
    } else {
      upcomingPayment.value = {
        title: 'No Upcoming Payments',
        description: 'Your account is up to date. Thank you for your prompt payments.',
        dueIn: '-',
        amount: 'RM 0.00'
      }
    }
  } catch (error) {
    console.error('Error fetching upcoming payments:', error)
    upcomingPayment.value = {
      title: 'Error Loading Payments',
      description: 'Could not load payment information.',
      dueIn: '-',
      amount: '-'
    }
  }
}

const currentAnnouncementIndex = ref(0)

const announcements = ref([])

// Function to fetch announcements
const fetchAnnouncements = async () => {
  try {
    const { data, error } = await supabase
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
      .limit(5)
    
    if (error) throw error
    
    if (data && data.length > 0) {
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
    } else {
      // Add a default announcement if none are found
      announcements.value = [{
        id: 'no-announcements',
        title: 'No Announcements',
        description: 'There are currently no announcements.',
        author: 'System',
        date: new Date().toLocaleDateString()
      }]
    }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    // Add a fallback announcement in case of error
    announcements.value = [{
      id: 'error',
      title: 'Error Loading Announcements',
      description: 'Could not load announcements. Please try again later.',
      author: 'System',
      date: new Date().toLocaleDateString()
    }]
  }
}

const complaints = ref([])

// Function to fetch user complaints
const fetchUserComplaints = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('Complaint')
      .select('complaintID, complaintTitle, complaintDescription, complaintPriority, complaintImageUrl, created_at, isResolved, isPending')
      .eq('complaintUserID', userId)
      .order('created_at', { ascending: false })
      .limit(4)
    
    if (error) throw error
    
    if (data && data.length > 0) {
      complaints.value = data.map(complaint => {
        // Format the date
        const date = new Date(complaint.created_at)
        const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} at ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`
        
        return {
          id: complaint.complaintID,
          title: complaint.complaintTitle,
          description: complaint.complaintDescription,
          status: getStatusText(complaint),
          submittedOn: formattedDate,
          priority: complaint.complaintPriority,
          imageUrl: complaint.complaintImageUrl,
          isResolved: complaint.isResolved,
          isPending: complaint.isPending
        }
      })
    } else {
      complaints.value = [{
        id: 'No complaints',
        title: 'No complaints submitted',
        description: 'You have not submitted any complaints yet.',
        status: 'N/A',
        submittedOn: '-',
        priority: 'N/A',
        imageUrl: null
      }]
    }
  } catch (error) {
    console.error('Error fetching user complaints:', error)
    complaints.value = [{
      id: 'Error',
      title: 'Error loading complaints',
      description: 'There was an error loading your complaints. Please try again later.',
      status: 'Error',
      submittedOn: '-',
      priority: 'N/A',
      imageUrl: null
    }]
  }
}

// Function to get status text based on isResolved and isPending fields
const getStatusText = (complaint) => {
  if (complaint.isResolved) return 'Resolved'
  if (complaint.isPending) return 'Reviewed'
  return 'Submitted'
}

// Function to get appropriate status class
const getStatusClass = (complaint) => {
  if (complaint.isResolved) return 'bg-green-100 text-green-700'
  if (complaint.isPending) return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}

// Function to truncate complaint ID
const truncateId = (id) => {
  if (!id) return ''
  if (id.length <= 20) return id
  return id.slice(0, 20) + '...'
}

// Function to handle quick action button clicks
const router = useRouter()
const handleQuickAction = (type) => {
  if (type === 'finance') {
    router.push('/resident/financialManagementResident')
  } else if (type === 'complaint') {
    router.push('/resident/complaintManagementResident')
  } else if (type === 'message') {
    router.push('/resident/chatroom')
  }
}

// Function to check if the attachment is an image
const isImageAttachment = (url) => {
  if (!url) return false
  
  const extension = url.split('.').pop()?.toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(extension)
}

// Function to view announcement details
const viewAnnouncementDetails = (announcement) => {
  selectedAnnouncement.value = announcement
  announcementDialog.value = true
}

const announcementDialog = ref(false)
const selectedAnnouncement = ref(null)

// Menu for the top-right hamburger button
const menuRef = ref()
const menuItems = ref([
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/resident/profile')
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => console.log('Settings clicked')
  },
  {
    separator: true
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: async () => {
      await authStore.logout()
      router.push('/')
    }
  }
])

// Function to toggle menu
const toggleMenu = (event) => {
  menuRef.value.toggle(event)
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

:deep(.p-card) {
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #4D5BBF;
}

:deep(.p-button.p-button-text) {
  color: inherit;
}

:deep(.p-badge) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.p-tag) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Quick Actions specific styles */
:deep(.p-card.text-center .pi) {
  color: white;
}

:deep(.p-card.text-center p) {
  color: white;
}

.rounded-tl-3xl {
  border-top-left-radius: 26px;
}

.rounded-tr-3xl {
  border-top-right-radius: 26px;
}

:deep(.p-avatar.p-avatar-circle img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.p-avatar.p-avatar-lg) {
  width: 48px;
  height: 48px;
}

:deep(.quick-action-btn) {
  width: 48px !important;
  height: 48px !important;
  @screen sm {
    width: 64px !important;
    height: 64px !important;
  }
  background: white !important;
  border: 2px solid #4D5BBF !important;
}

:deep(.quick-action-btn .pi) {
  font-size: 1.25rem;
  @screen sm {
    font-size: 1.5rem;
  }
  color: #4D5BBF !important;
}

:deep(.quick-action-btn:hover) {
  background: rgba(77, 91, 191, 0.04) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: #4D5BBF;
}

@media (max-width: 640px) {
  .rounded-tl-3xl {
    border-top-left-radius: 20px;
  }

  .rounded-tr-3xl {
    border-top-right-radius: 20px;
  }

  :deep(.p-card) {
    border-radius: 12px;
  }
}

/* Verification pending styles */
.verification-pending {
  position: absolute !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
}

.verification-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(77, 91, 191, 0.1);
}

.verification-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(77, 91, 191, 0.3);
  animation: pulse 2s infinite;
}

.animation-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

:deep(.verification-pending-card .p-card-content) {
  padding: 1.5rem;
}

:deep(.verification-pending-card .p-card-body) {
  padding: 0;
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

.action-item {
  animation: pop-in 0.4s ease-out forwards;
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

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  70% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.custom-indicators {
  margin-top: 0.5rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(77, 91, 191, 0.3);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.indicator-dot.active {
  background-color: #4D5BBF;
}

/* Add this to the style section for the announcement carousel */
.announcement-carousel {
  width: 100%;
}

:deep(.announcement-carousel .p-carousel-container) {
  width: 100%;
}

/* Complaints card styles */
.complaint-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.complaint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}

/* Payment card styles */
:deep(.payment-card) {
  border: 1px solid #edf2f7;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.payment-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
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

/* Floating bubbles animation styles */
.bubbles-container {
  z-index: 1;
}

.bubble {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  opacity: 0;
  animation-duration: 10s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.bubble-1 {
  width: 50px;
  height: 50px;
  bottom: -25px;
  left: 10%;
  animation-name: bubble-float-1;
  animation-delay: 0s;
}

.bubble-2 {
  width: 35px;
  height: 35px;
  bottom: -20px;
  left: 30%;
  animation-name: bubble-float-2;
  animation-delay: 2s;
}

.bubble-3 {
  width: 45px;
  height: 45px;
  bottom: -25px;
  left: 50%;
  animation-name: bubble-float-3;
  animation-delay: 1s;
}

.bubble-4 {
  width: 30px;
  height: 30px;
  bottom: -20px;
  left: 70%;
  animation-name: bubble-float-4;
  animation-delay: 3s;
}

.bubble-5 {
  width: 40px;
  height: 40px;
  bottom: -25px;
  left: 85%;
  animation-name: bubble-float-5;
  animation-delay: 0.5s;
}

@keyframes bubble-float-1 {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-120px) scale(1.2);
    opacity: 0;
  }
}

@keyframes bubble-float-2 {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) translateX(10px) scale(1.3);
    opacity: 0;
  }
}

@keyframes bubble-float-3 {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-140px) translateX(-15px) scale(1.2);
    opacity: 0;
  }
}

@keyframes bubble-float-4 {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-90px) translateX(10px) scale(1.4);
    opacity: 0;
  }
}

@keyframes bubble-float-5 {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-130px) translateX(-5px) scale(1.3);
    opacity: 0;
  }
}
</style>