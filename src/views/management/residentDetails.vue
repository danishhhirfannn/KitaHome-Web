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
                    <div v-if="user.identification_url && !user.isVerified && !user.isDeclined" class="flex gap-2">
                      <Button
                        label="Accept"
                        icon="pi pi-check"
                        severity="success"
                        text
                        size="small"
                        @click="updateVerificationStatus('accept')"
                      />
                      <Button
                        label="Decline"
                        icon="pi pi-times"
                        severity="danger"
                        text
                        size="small"
                        @click="handleDeclineClick"
                      />
                    </div>
                  </div>
                  <div v-if="user.identification_url" class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <i class="pi pi-id-card text-primary-500"></i>
                        <a 
                          href="#" 
                          class="text-sm font-medium text-primary-600 hover:text-primary-700"
                          @click.prevent="viewDocument(user.identification_url)"
                        >
                          View Identification Document
                        </a>
                      </div>
                      <Button
                        icon="pi pi-external-link"
                        text
                        @click="viewDocument(user.identification_url)"
                        class="!text-primary-600"
                      />
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
                      <ul class="space-y-3">
                        <li v-for="(transaction, index) in [
                          { date: 'Mar 1, 2024', type: 'March Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Feb 1, 2024', type: 'February Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Jan 1, 2024', type: 'January Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Dec 1, 2023', type: 'December Maintenance Fee', amount: 250.00, status: 'paid' },
                          { date: 'Nov 1, 2023', type: 'November Maintenance Fee', amount: 250.00, status: 'paid' }
                        ]" :key="index"
                          class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <i class="pi pi-wallet text-primary-500 text-sm"></i>
                            </div>
                            <div>
                              <p class="text-sm font-medium text-gray-900">{{ transaction.type }}</p>
                              <p class="text-xs text-gray-500">{{ transaction.date }}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-base font-semibold text-green-600">RM {{ transaction.amount.toFixed(2) }}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Complaints Section -->
              <div v-if="activeSection === 'Complaints'" :key="'complaints'" class="w-full">
                <div class="space-y-4">
                  <h4 class="text-lg font-semibold text-gray-900">Complaint History</h4>
                  <ul class="space-y-3">
                    <li v-for="complaint in [
                      {
                        complainID: 'CMP001',
                        complainDescription: 'Persistent noise disturbance from unit above (A-15-02) during late hours between 11 PM to 2 AM. The disturbances include heavy furniture dragging, loud footsteps, and excessive music volume that reverberates through the ceiling. This has been occurring consistently for the past week, significantly impacting the sleep quality and daily routines of all household members. Multiple attempts to communicate with the upstairs neighbors have been unsuccessful.',
                        complainStatus: 'Resolved',
                        complainSeverity: 'High',
                        complainSentimentScore: -0.8,
                        complainMagnitude: 0.9,
                        complainCreatedAt: '2024-03-15T08:30:00'
                      },
                      {
                        complainID: 'CMP002',
                        complainDescription: 'Severe water leakage detected in the master bedroom ceiling, specifically near the air-conditioning unit and extending towards the window area. The leak has caused visible water stains, paint bubbling, and concerning moisture damage to the ceiling structure. During heavy rainfall, water actively drips onto the bed and carpet area, creating potential safety hazards and promoting mold growth. Emergency temporary fixes have been ineffective.',
                        complainStatus: 'In Progress',
                        complainSeverity: 'Medium',
                        complainSentimentScore: -0.6,
                        complainMagnitude: 0.7,
                        complainCreatedAt: '2024-03-10T14:15:00'
                      }
                    ]" :key="complaint.complainID" 
                      class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex items-start gap-3">
                          <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <i class="pi pi-exclamation-circle text-red-500 text-sm"></i>
                          </div>
                          <div class="flex-1">
                            <span class="text-md font-medium text-gray-900">{{ complaint.complainID }}</span>
                            <p class="text-sm text-gray-700 mt-1">{{ complaint.complainDescription }}</p>
                            <div class="flex items-center gap-4 mt-2">
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Sentiment:</span>
                                <span :class="{
                                  'text-xs font-medium': true,
                                  'text-red-600': complaint.complainSentimentScore < -0.5,
                                  'text-orange-600': complaint.complainSentimentScore >= -0.5 && complaint.complainSentimentScore < 0,
                                  'text-green-600': complaint.complainSentimentScore >= 0
                                }">{{ complaint.complainSentimentScore.toFixed(2) }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Magnitude:</span>
                                <span class="text-xs font-medium text-primary-600">{{ complaint.complainMagnitude.toFixed(2) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                          <div class="flex flex-row gap-2 whitespace-nowrap">
                            <span :class="{
                              'px-2 py-1 text-xs rounded-full font-medium inline-block': true,
                              'bg-green-100 text-green-700': complaint.complainStatus === 'Resolved',
                              'bg-yellow-100 text-yellow-700': complaint.complainStatus === 'In Progress',
                              'bg-gray-100 text-gray-700': complaint.complainStatus === 'Pending'
                            }">{{ complaint.complainStatus }}</span>
                            <span :class="{
                              'px-2 py-1 text-xs rounded-full font-medium inline-block': true,
                              'bg-red-100 text-red-700': complaint.complainSeverity === 'High',
                              'bg-orange-100 text-orange-700': complaint.complainSeverity === 'Medium',
                              'bg-blue-100 text-blue-700': complaint.complainSeverity === 'Low'
                            }">{{ complaint.complainSeverity }}</span>
                          </div>
                          <div class="flex flex-col items-end text-xs text-gray-500">
                            <span>
                              {{ new Date(complaint.complainCreatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) }}
                            </span>
                            <span>
                              {{ new Date(complaint.complainCreatedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
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

const activeSection = ref('Identity')
const sections = ['Identity', 'Finance', 'Complaints', 'Documents']

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

onMounted(() => {
  fetchUserDetails()
    .then(() => {
      fetchDocuments()
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
</style>