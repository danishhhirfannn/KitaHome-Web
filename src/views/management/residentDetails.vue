<template>
  <Toast />
  <div class="p-8">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Resident Details</h1>
        <p class="text-gray-600 mt-2">View and manage resident information</p>
      </div>
      <Button
        icon="pi pi-arrow-left"
        label="Back to Residents"
        text
        @click="router.back()"
      />
    </div>

    <div v-if="user" class="space-y-6">
      <div class="flex flex-row gap-6">

        <!-- User Basic Info with Roles & Status -->
      <div class="bg-white rounded-lg shadow border border-gray-200 p-6 w-full">
        <div class="flex items-start gap-6">
          <!-- Left side - Avatar -->
          <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-semibold">
            {{ user.fullName?.charAt(0).toUpperCase() }}
          </div>

          <!-- Middle - User Info -->
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">{{ user.fullName }}</h3>
            <div class="mt-2 space-y-1">
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-envelope mr-2"></i>
                {{ user.email }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="pi pi-phone mr-2"></i>
                {{ user.phone || 'No phone number' }}
              </div>
            </div>
          </div>

          <!-- Right side - Roles & Status -->
          <div class="flex flex-col items-end gap-2">
            <div class="flex gap-2">
              <span v-if="user.isAdmin" 
                class="px-3 py-1 text-xs rounded-full bg-pink-100 text-pink-700 font-medium">
                Admin
              </span>
              <span v-if="user.isManagement" 
                class="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                Management
              </span>
              <span v-if="user.isResident" 
                class="px-3 py-1 text-xs rounded-full bg-primary-100 text-primary-700 font-medium">
                Resident
              </span>
            </div>
            <span :class="{
              'px-3 py-1 text-xs rounded-full font-medium': true,
              'bg-green-100 text-green-800': user.isVerified,
              'bg-red-100 text-red-800': user.isDeclined,
              'bg-yellow-100 text-yellow-800': !user.isVerified && !user.isDeclined
            }">
              {{ user.isVerified ? 'Verified' : user.isDeclined ? 'Declined' : 'Pending' }}
            </span>
          </div>
        </div>
      </div>
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div v-if="user.Residence?.displayPhotoUrl" 
                class="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <img 
                  :src="user.Residence.displayPhotoUrl" 
                  alt="Residence photo"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1">
                <div class="text-md text-surface-900 font-medium">
                  {{ user.Residence?.residenceName || 'Not assigned' }}
                </div>
                <div class="text-sm text-surface-500">
                  {{ user.unitNumber || 'Not assigned' }}
                </div>
                <div class="text-xs text-surface-500 mt-1">
                  {{ user.Residence?.residenceAddress }}
                </div>
              </div>
            </div>
        </div>
      </div>

      </div>

      <!-- Tabs for different sections -->
      <div class="border border-gray-200 rounded-lg bg-white overflow-hidden shadow">
        <div class="border-b border-gray-200 flex justify-between items-center">
          <SelectButton v-model="activeSection" :options="sections" class="m-4" />
          <div>
            <Button
            label="Chat"
            icon="pi pi-comments"
            text
            class=""
            size="small" />

            <Button
            label="Disable User"
            icon="pi pi-ban"
            severity="danger"
            text
            class="!text-red-600 hover:!bg-red-50 mr-4"
            size="small" />
          </div>
        </div>

        <!-- Replace the existing content div with this -->
        <div class="p-6">
          <div class="transition-wrapper">
            <TransitionGroup name="fade-slide">
              <!-- Identity Section -->
              <div v-if="activeSection === 'Identity'" :key="'identity'" class="w-full">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-lg font-semibold text-gray-900">Identity Verification</h4>
                    <span :class="{
                      'px-3 py-1 text-sm rounded-full font-medium': true,
                      'bg-green-100 text-green-800': user.isVerified,
                      'bg-red-100 text-red-800': user.isDeclined,
                      'bg-yellow-100 text-yellow-800': !user.isVerified && !user.isDeclined
                    }">
                      {{ user.isVerified ? 'Verified' : user.isDeclined ? 'Declined' : 'Pending Verification' }}
                    </span>
                  </div>
                  <div v-if="user.identification_url" class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="showIdDialog = true">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-id-card text-primary-500"></i>
                      <span class="text-sm font-medium text-primary-600 hover:text-primary-700">
                        View Identification Document
                      </span>
                    </div>
                  </div>
                  <div v-else class="flex items-center gap-2 text-gray-400 p-4 border border-gray-200 rounded-lg">
                    <i class="pi pi-file"></i>
                    <span>No ID Submitted</span>
                  </div>
                </div>
              </div>

              <!-- Finance Section -->
              <div v-if="activeSection === 'Finance'" :key="'finance'" class="w-full">
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900">Financial Information</h4>
                  <div class="space-y-6">
                    <div>
                      <h5 class="text-sm font-medium text-gray-500 mb-3">Transaction History</h5>
                      <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500">
                        <i class="pi pi-wallet text-4xl mb-2"></i>
                        <p>No transactions found</p>
                      </div>
                      <Accordion v-else :multiple="true" :activeIndex="[0]" class="custom-accordion">
                        <AccordionTab v-for="year in getAvailableYears()" :key="year">
                          <template #header>
                            <div class="flex items-center gap-2">
                              <i class="pi pi-folder text-primary-500"></i>
                              <span class="font-medium">{{ year }}</span>
                              <span class="text-xs text-gray-500 ml-2">
                                ({{ getTransactionsByYear(year).length }} transactions)
                              </span>
                            </div>
                          </template>
                          <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-3">
                              <span class="text-sm font-medium text-gray-500">Total for {{ year }}</span>
                              <span class="text-base font-semibold text-primary-600">
                                RM {{ getYearTotal(year).toFixed(2) }}
                              </span>
                            </div>
                            <ul class="space-y-3">
                              <li v-for="transaction in getTransactionsByYear(year)" :key="transaction.transactionID"
                                class="flex items-center justify-between py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div class="flex items-start gap-3">
                                  <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                    <i class="pi pi-wallet text-primary-500 text-lg"></i>
                                  </div>
                                  <div>
                                    <div class="flex items-center gap-2">
                                      <p class="text-sm font-medium text-gray-900">{{ transaction.transactionTitle }}</p>
                                      <span v-if="transaction.isLate" class="text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                                        Late
                                      </span>
                                    </div>
                                    <p class="text-xs text-gray-500">{{ formatDate(transaction.created_at) }}</p>
                                    <p v-if="transaction.transactionDescription" class="text-xs text-gray-500 mt-1">
                                      {{ transaction.transactionDescription }}
                                    </p>
                                  </div>
                                </div>
                                <span class="text-base font-semibold" :class="{
                                  'text-green-600': !transaction.isLate,
                                  'text-yellow-600': transaction.isLate
                                }">
                                  RM {{ transaction.transactionAmount.toFixed(2) }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </AccordionTab>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Complaints Section -->
              <div v-if="activeSection === 'Complaints'" :key="'complaints'" class="w-full">
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900">Complaint History</h4>
                  <Tabs v-model:value="activeTabIndex" class="mb-6">
                    <TabList>
                      <Tab value="0">Active Complaints</Tab>
                      <Tab value="1">Complaint History</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel value="0" class="tab-panel">
                        <!-- Empty state -->
                        <div v-if="activeComplaints.length === 0" class="flex flex-col items-center justify-center py-12">
                          <i class="pi pi-check-circle text-gray-300 text-5xl mb-4"></i>
                          <h4 class="text-gray-500 font-medium text-sm mb-2">No active complaints</h4>
                          <p class="text-gray-400 text-xs text-center max-w-xs">No active complaints at this time.</p>
                        </div>
                        
                        <!-- Active Complaints List -->
                        <div v-else class="space-y-3">
                          <div v-for="complaint in activeComplaints" :key="complaint.complaintID" 
                               class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden complaint-card">
                            <div class="flex flex-col h-full">
                              <div class="flex items-center px-4 py-3 border-b border-gray-100">
                                <i class="pi pi-exclamation-circle mr-2 text-primary"></i>
                                <span class="text-xs font-medium tracking-wide text-primary">
                                  {{ complaint.complaintID }}
                                </span>
                                <div :class="[
                                  'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium',
                                  getPriorityClass(complaint.complaintPriority)
                                ]">
                                  {{ complaint.complaintPriority }}
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
                                    @click="openImagePreview(complaint.complaintImageUrl, $event)"
                                  />
                                </div>
                                
                                <div class="flex justify-between items-center mt-auto">
                                  <span class="text-xs text-gray-500 font-light">{{ formatDate(complaint.created_at) }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabPanel>
                      
                      <TabPanel value="1" class="tab-panel">
                        <!-- Empty state -->
                        <div v-if="complaintHistory.length === 0" class="flex flex-col items-center justify-center py-12">
                          <i class="pi pi-history text-gray-300 text-5xl mb-4"></i>
                          <h4 class="text-gray-500 font-medium text-sm mb-2">No complaint history</h4>
                          <p class="text-gray-400 text-xs text-center max-w-xs">Complaint history will appear here.</p>
                        </div>
                        
                        <!-- Complaint History List -->
                        <div v-else class="space-y-3">
                          <div v-for="complaint in complaintHistory" :key="complaint.complaintID" 
                               class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden complaint-card">
                            <div class="flex flex-col h-full">
                              <div class="flex items-center px-4 py-3 border-b border-gray-100">
                                <i class="pi pi-exclamation-circle mr-2 text-primary"></i>
                                <span class="text-xs font-medium tracking-wide text-primary">
                                  {{ complaint.complaintID }}
                                </span>
                                <div :class="[
                                  'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium',
                                  getPriorityClass(complaint.complaintPriority)
                                ]">
                                  {{ complaint.complaintPriority }}
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
                                    @click="openImagePreview(complaint.complaintImageUrl, $event)"
                                  />
                                </div>
                                
                                <div class="flex justify-between items-center mt-auto">
                                  <span class="text-xs text-gray-500 font-light">{{ formatDate(complaint.created_at) }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
              </div>

              <!-- Add Documents Section -->
              <div v-if="activeSection === 'Documents'" :key="'documents'" class="w-full">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-lg font-semibold text-gray-900">Financial Documents</h4>
                    <div>
                      <label for="fileUpload" class="cursor-pointer">
                        <Button 
                          icon="pi pi-upload" 
                          label="Upload Document" 
                          class="p-button-sm p-button-outlined"
                          type="button"
                          @click="triggerFileInput"
                        />
                        <input 
                          id="fileUpload" 
                          type="file" 
                          ref="fileInputRef"
                          @change="handleFileUpload" 
                          class="hidden" 
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <!-- Empty state -->
                  <div v-if="documents.length === 0" class="flex flex-col items-center justify-center py-12">
                    <i class="pi pi-file text-gray-300 text-5xl mb-4"></i>
                    <h4 class="text-gray-500 font-medium text-sm mb-2">No documents found</h4>
                    <p class="text-gray-400 text-xs text-center max-w-xs">Upload financial documents like receipts, statements, or contracts for easy access.</p>
                  </div>
                  
                  <!-- Documents List -->
                  <div v-else class="space-y-3">
                    <div 
                      v-for="document in documents" 
                      :key="document.documentID" 
                      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      @click="openDocument(document)"
                    >
                      <div class="p-4 flex items-center">
                        <!-- File icon based on type -->
                        <div class="mr-3">
                          <i 
                            :class="[
                              'pi text-xl', 
                              getFileIconClass(document)
                            ]"
                          ></i>
                        </div>
                        
                        <!-- Document info -->
                        <div class="flex-1">
                          <h4 class="text-sm font-semibold text-gray-800 mb-1">{{ getDocumentName(document) }}</h4>
                          <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">{{ formatDate(document.created_at) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add the ID verification dialog -->
  <Dialog
    v-model:visible="showIdDialog"
    modal
    header="Identity Verification"
    :style="{ width: '50rem' }"
    :closable="true"
  >
    <div class="flex flex-col gap-4">
      <div class="flex justify-center">
        <img 
          :src="user?.identification_url" 
          alt="Identification Document"
          class="max-w-full max-h-[500px] object-contain"
        />
      </div>
      <div v-if="!user.isVerified && !user.isDeclined" class="flex justify-end gap-2 mt-4">
        <Button
          label="Decline"
          icon="pi pi-times"
          severity="danger"
          @click="handleDeclineClick"
        />
        <Button
          label="Accept"
          icon="pi pi-check"
          severity="success"
          @click="updateVerificationStatus('accept')"
        />
      </div>
    </div>
  </Dialog>

  <!-- Add the decline dialog -->
  <Dialog
    v-model:visible="showDeclineDialog"
    modal
    header="Decline Reason"
    :style="{ width: '30rem' }"
    :closable="false"
  >
    <div class="flex flex-col gap-4">
      <p class="text-gray-600">Please provide a reason for declining this user's verification.</p>
      <Textarea
        v-model="declineReason"
        rows="3"
        placeholder="Enter decline reason..."
        class="w-full"
        autoResize
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showDeclineDialog = false"
          text
        />
        <Button
          label="Confirm"
          icon="pi pi-check"
          @click="confirmDecline"
          severity="danger"
        />
      </div>
    </template>
  </Dialog>

  <!-- File upload preview modal -->
  <Dialog 
    v-model:visible="uploadPreviewVisible" 
    header="Upload Document" 
    :modal="true" 
    :dismissableMask="true" 
    :style="{width: '90vw', maxWidth: '700px'}"
  >
    <div class="upload-preview-container">
      <!-- File info -->
      <div class="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
        <i class="pi pi-file text-xl text-primary mr-3"></i>
        <div class="flex-1">
          <p class="font-medium text-sm">{{ uploadFile?.name }}</p>
          <p class="text-xs text-gray-500">{{ formatFileSize(uploadFile?.size) }}</p>
        </div>
      </div>
      
      <!-- File name input -->
      <div class="mb-4">
        <label for="fileName" class="block text-sm font-medium text-gray-700 mb-1">File Name</label>
        <div class="relative">
          <input 
            id="fileName" 
            v-model="customFileName" 
            type="text" 
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" 
            placeholder="Enter a custom file name"
          />
          <div class="text-xs text-gray-500 mt-1">
            The file will be saved with this name. File extension will be added automatically.
          </div>
        </div>
      </div>
      
      <!-- Preview if possible -->
      <div v-if="uploadPreviewUrl" class="mb-4">
        <img 
          v-if="uploadPreviewUrl && (uploadFile?.type.includes('image'))"
          :src="uploadPreviewUrl" 
          alt="Upload preview" 
          class="max-w-full max-h-[300px] mx-auto border rounded"
        />
      </div>
      
      <!-- Upload button -->
      <div class="flex justify-end">
        <Button 
          label="Cancel" 
          class="p-button-text mr-2" 
          @click="cancelUpload"
        />
        <Button 
          label="Upload Document" 
          icon="pi pi-upload" 
          class="p-button-primary" 
          @click="uploadDocument"
          :loading="isUploading"
        />
      </div>
    </div>
  </Dialog>

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
</template>

<script setup>
import Toast from 'primevue/toast'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/api/supabase'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { TransitionGroup } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { logService } from '@/api/logService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const showDeclineDialog = ref(false)
const declineReason = ref('')
const toast = useToast()

const documents = ref([])
const uploadPreviewVisible = ref(false)
const uploadFile = ref(null)
const uploadPreviewUrl = ref(null)
const isUploading = ref(false)
const fileInputRef = ref(null)
const customFileName = ref('')
const showIdDialog = ref(false)

const transactions = ref([])

const activeComplaints = ref([])
const complaintHistory = ref([])
const isImagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const activeSection = ref('Identity')
const sections = ['Identity', 'Finance', 'Complaints', 'Documents']
const activeTabIndex = ref('0')

const fetchUserDetails = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        Residence!inner (
          residenceName,
          displayPhotoUrl,
          residenceAddress
        )
      `)
      .eq('userID', route.params.id)
      .single()

    if (error) throw error
    user.value = data
    
    // Log the view action
    try {
      const logResult = await logService.logAction({
        action: 'view',
        description: `Viewed resident profile: ${data.fullName} (${data.email})`,
        targetTable: 'User',
        targetID: data.userID
      })
      
      if (!logResult.success) {
        console.warn('Failed to log view action:', logResult.error)
      }
    } catch (logError) {
      console.error('Error logging view action:', logError)
    }
    
    // Log the response to help with debugging
    console.log('User data:', data)
  } catch (error) {
    console.error('Error fetching user details:', error.message)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to fetch user details: ${error.message}`,
      life: 3000
    })
  }
}

const viewDocument = (url) => {
  window.open(url, '_blank')
}

const updateVerificationStatus = async (action, reason = '') => {
  try {
    const updates = {
      isVerified: action === 'accept',
      isDeclined: action === 'decline',
      declineReason: action === 'decline' ? reason : null
    }

    const { error } = await supabase
      .from('User')
      .update(updates)
      .eq('userID', user.value.userID)

    if (error) throw error

    // Update local state
    user.value = {
      ...user.value,
      ...updates
    }
    
    // Log the verification action
    await logService.logAction({
      action: action === 'accept' ? 'verify' : 'reject',
      description: `${action === 'accept' ? 'Verified' : 'Declined'} resident: ${user.value.fullName} (${user.value.email})`,
      targetTable: 'User',
      targetID: user.value.userID,
      metadata: { 
        action,
        reason: reason || null
      }
    })

    // Show success toast
    toast.add({
      severity: action === 'accept' ? 'success' : 'info',
      summary: action === 'accept' ? 'User Verified' : 'User Declined',
      detail: `${user.value.fullName}'s verification has been ${action}ed.`,
      life: 3000
    })

    showDeclineDialog.value = false
    declineReason.value = ''

  } catch (error) {
    console.error('Error updating verification status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update verification status.',
      life: 3000
    })
  }
}

const handleDeclineClick = () => {
  declineReason.value = ''
  showDeclineDialog.value = true
}

const confirmDecline = async () => {
  if (!declineReason.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please provide a reason for declining',
      life: 3000
    })
    return
  }
  await updateVerificationStatus('decline', declineReason.value)
}

// Document related functions
const triggerFileInput = () => {
  // Directly trigger the file input click
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = (event) => {
  console.log('File input changed')
  const file = event.target.files[0]
  if (!file) {
    console.log('No file selected')
    return
  }
  
  console.log('File selected:', file.name, file.type, file.size)
  uploadFile.value = file
  
  // Set initial custom file name (without extension)
  const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
  customFileName.value = fileNameWithoutExt
  
  // Create preview URL for images
  if (file.type.includes('image')) {
    uploadPreviewUrl.value = URL.createObjectURL(file)
  } else {
    uploadPreviewUrl.value = null
  }
  
  uploadPreviewVisible.value = true
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const cancelUpload = () => {
  uploadFile.value = null
  uploadPreviewUrl.value = null
  uploadPreviewVisible.value = false
  customFileName.value = ''
}

const uploadDocument = () => {
  if (!uploadFile.value) {
    console.error('No file to upload')
    return
  }
  
  if (!customFileName.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please enter a file name',
      life: 3000
    })
    return
  }
  
  isUploading.value = true
  console.log('Starting upload process...')
  
  // Use Promise chain instead of async/await
  supabase.auth.getUser()
    .then(({ data: { user: adminUser } }) => {
      if (!adminUser) {
        throw new Error('User not authenticated')
      }
      
      console.log('Uploading document for user:', user.value.userID)
      
      // Create file path with custom name
      const fileExt = uploadFile.value.name.split('.').pop()
      const safeFileName = customFileName.value
        .replace(/[^a-zA-Z0-9_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF -]/g, '') // Remove special chars except dash and space
        .trim()
      
      const uniqueId = Math.random().toString(36).substring(2, 8)
      const fileName = `${uniqueId}_${safeFileName}.${fileExt}`
      const filePath = `${user.value.userID}/${fileName}`
      
      console.log('Uploading to path:', filePath)
      
      // Upload to storage
      return supabase.storage
        .from('finance-documents')
        .upload(filePath, uploadFile.value)
        .then(({ data: uploadData, error: uploadError }) => {
          if (uploadError) throw uploadError
          
          console.log('Upload successful:', uploadData)
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('finance-documents')
            .getPublicUrl(filePath)
          
          const publicUrl = urlData.publicUrl
          console.log('Public URL:', publicUrl)
          
          // Save reference in database with custom name
          return supabase
            .from('Finance_Documents')
            .insert({
              documentUserID: user.value.userID,
              documentResidenceID: user.value.residenceID,
              documentUrl: publicUrl,
              documentName: safeFileName + '.' + fileExt // Store the custom name in database
            })
        })
    })
    .then(({ data: dbData, error: dbError }) => {
      if (dbError) throw dbError
      
      console.log('Database entry created:', dbData)
      
      // Refresh documents list
      fetchDocuments()
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Document uploaded successfully',
        life: 3000
      })
      
      // Close modal and reset
      cancelUpload()
    })
    .catch(error => {
      console.error('Error uploading document:', error)
      
      // More specific error message based on the error
      let errorMessage = 'Failed to upload document'
      
      if (error.message?.includes('storage') || error.message?.includes('bucket')) {
        errorMessage = 'Storage error: Please ensure the bucket exists and is properly configured'
      } else if (error.message?.includes('permission') || error.message?.includes('access')) {
        errorMessage = 'Permission denied: You don\'t have access to upload files'
      } else if (error.message?.includes('size')) {
        errorMessage = 'File too large: Please choose a smaller file'
      }
      
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    })
    .finally(() => {
      isUploading.value = false
      // Ensure the file input is reset
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    })
}

const fetchDocuments = () => {
  if (!user.value || !user.value.userID) return
  
  supabase
    .from('Finance_Documents')
    .select('*')
    .eq('documentUserID', user.value.userID)
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) throw error
      
      console.log('Fetched documents:', data)
      if (data && data.length > 0) {
        console.log('First document sample:', data[0])
        console.log('Document structure:', Object.keys(data[0]))
      }
      
      documents.value = data || []
    })
    .catch(error => {
      console.error('Error fetching documents:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load documents',
        life: 3000
      })
    })
}

const openDocument = (document) => {
  const url = getDocumentUrl(document);
  if (url) {
    console.log('Opening document in new tab:', url);
    window.open(url, '_blank');
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Cannot open document: URL not found',
      life: 3000
    });
  }
}

const getDocumentUrl = (doc) => {
  if (!doc) return '';
  return doc.documentUrl || '';
}

const getDocumentName = (doc) => {
  if (!doc) return 'Unknown file';
  
  // If document has a custom name stored, use it directly
  if (doc.documentName) {
    return doc.documentName;
  }
  
  // Otherwise fall back to extracting from URL
  const url = getDocumentUrl(doc);
  return getDocumentFileName(url);
}

const getDocumentFileName = (url) => {
  if (!url) return 'Unknown file'
  
  // Extract filename from URL
  const urlParts = url.split('/')
  let fileName = urlParts[urlParts.length - 1]
  
  // Remove random string prefix if present
  const parts = fileName.split('_')
  if (parts.length > 1 && parts[0].length <= 15) {
    fileName = parts.slice(1).join('_')
  }
  
  // Remove timestamp if present
  const timestampMatch = fileName.match(/^\d+_(.+)$/)
  if (timestampMatch) {
    fileName = timestampMatch[1]
  }
  
  // Decode URI components
  try {
    fileName = decodeURIComponent(fileName)
  } catch (e) {
    // If decoding fails, use the original
  }
  
  return fileName
}

const getFileIconClass = (doc) => {
  const url = getDocumentUrl(doc);
  if (!url) return 'pi-file text-gray-500';
  
  if (url.includes('.pdf')) return 'pi-file-pdf text-red-500';
  if (url.includes('.doc')) return 'pi-file-word text-blue-500';
  if (url.includes('.xls')) return 'pi-file-excel text-green-500';
  if (url.includes('.jpg') || url.includes('.png')) return 'pi-image text-purple-500';
  
  return 'pi-file text-gray-500';
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-MY', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

const fetchTransactions = async () => {
  if (!user.value || !user.value.userID) return
  
  try {
    const { data, error } = await supabase
      .from('Transaction')
      .select('*')
      .eq('transactionUserID', user.value.userID)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    console.log('Fetched transactions:', data)
    transactions.value = data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load transactions',
      life: 3000
    })
  }
}

const getTransactionsByYear = (year) => {
  console.log('Filtering transactions for year:', year)
  console.log('All transactions:', transactions.value)
  const filtered = transactions.value.filter(t => {
    const transactionDate = new Date(t.created_at)
    return transactionDate.getFullYear().toString() === year
  })
  console.log('Filtered transactions:', filtered)
  return filtered
}

const getYearTotal = (year) => {
  return getTransactionsByYear(year).reduce((total, transaction) => total + transaction.transactionAmount, 0)
}

const getAvailableYears = () => {
  if (!transactions.value.length) return []
  const years = new Set(transactions.value.map(t => new Date(t.created_at).getFullYear().toString()))
  return Array.from(years).sort((a, b) => b - a)
}

const fetchComplaints = async () => {
  if (!user.value || !user.value.userID) return
  
  try {
    const { data, error } = await supabase
      .from('Complaint')
      .select('*')
      .eq('complaintUserID', user.value.userID)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Separate active and historical complaints
    activeComplaints.value = data.filter(complaint => !complaint.isResolved)
    complaintHistory.value = data.filter(complaint => complaint.isResolved)
  } catch (error) {
    console.error('Error fetching complaints:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load complaints',
      life: 3000
    })
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700'
    case 'Medium':
      return 'bg-orange-100 text-orange-700'
    case 'Low':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const truncateId = (id) => {
  if (!id) return ''
  if (id.length <= 20) return id
  return id.slice(0, 20) + '...'
}

const openImagePreview = (imageUrl, event) => {
  if (event) {
    event.stopPropagation()
  }
  previewImageUrl.value = imageUrl
  isImagePreviewVisible.value = true
}

const closeImagePreview = () => {
  isImagePreviewVisible.value = false
}

onMounted(() => {
  fetchUserDetails()
    .then(() => {
      fetchDocuments()
      fetchTransactions()
      fetchComplaints()
    })
})
</script>

<style>
.transition-wrapper {
  position: relative;
  min-height: 200px;
}

.fade-slide-move,
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-active {
  position: absolute;
  width: 100%;
}

.custom-accordion .p-accordion-header .p-accordion-header-link {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.custom-accordion .p-accordion-header .p-accordion-header-link:hover {
  background-color: #f9fafb;
}

.custom-accordion .p-accordion-content {
  padding: 0;
  border: none;
}

/* Complaint card style */
.complaint-card {
  transition: all 0.2s ease;
}

.complaint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Line clamp utility class */
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
</style>