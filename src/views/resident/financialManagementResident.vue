<template>
  <div class="min-h-screen bg-primary-500">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="loading-container">
        <img src="@/assets/SmallHome_Logo.png" alt="Logo" class="loading-logo" />
        <div class="loading-spinner"></div>
      </div>
      <p class="text-white text-sm mt-4">Loading your financial data...</p>
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
          <h2 class="text-md font-normal text-white tracking-wide">Finance</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Tab Navigation -->
        <Tabs v-model:value="activeTabIndex" class="mb-6">
          <TabList>
            <Tab value="0">Invoices</Tab>
            <Tab value="1">Transactions</Tab>
            <Tab value="2">Documents</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0" class="tab-panel">
              <h3 class="text-lg font-semibold text-primary-500 pl-1 pb-3 slide-in-left">Upcoming Payment</h3>
              <!-- Empty state -->
              <div v-if="invoices.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
                <i class="pi pi-check-circle text-gray-300 text-5xl mb-4"></i>
                <h4 class="text-gray-500 font-medium text-sm mb-2">No pending invoices</h4>
                <p class="text-gray-400 text-xs text-center max-w-xs">You're all caught up! There are no pending invoices at this time.</p>
              </div>
              
              <!-- Invoices List -->
              <div v-else class="space-y-3 slide-in-left">
                <div v-for="invoice in invoices" :key="invoice.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="text-sm font-semibold text-gray-800">{{ invoice.title }}</h4>
                      <div class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium flex items-center gap-1">
                        <i class="pi pi-clock" style="font-size: 8px"></i>
                        {{ invoice.dueIn }}
                      </div>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">{{ invoice.description }}</p>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-500">Due: {{ invoice.dueDate }}</span>
                      <span class="text-sm font-medium text-primary">{{ invoice.amount }}</span>
                    </div>
                    <Button label="Pay Now" icon="pi pi-credit-card" class="p-button-sm p-button-text p-button-white mt-3 w-full custom-pay-button" />
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="1" class="tab-panel">
              <h3 class="text-lg font-semibold text-primary-500 pl-1 pb-3 slide-in-left">Payment History</h3>
              <!-- Empty state -->
              <div v-if="transactions.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
                <i class="pi pi-money-bill text-gray-300 text-5xl mb-4"></i>
                <h4 class="text-gray-500 font-medium text-sm mb-2">No payment history found</h4>
                <p class="text-gray-400 text-xs text-center max-w-xs">Once you have made payments, they will appear here for your reference.</p>
              </div>
              
              <!-- Transactions List -->
              <div v-else class="space-y-3 slide-in-left">
                <div v-for="transaction in transactions" :key="transaction.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="text-sm font-semibold text-gray-800">{{ transaction.title }}</h4>
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      ]">
                        {{ transaction.status }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">{{ transaction.description }}</p>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-gray-500">{{ transaction.date }}</span>
                      <span class="text-sm font-medium text-primary">{{ transaction.amount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <TabPanel value="2" class="tab-panel">
              <!-- Header with upload button -->
              <div class="flex justify-between items-center mb-4 slide-in-left">
                <h3 class="text-lg font-semibold text-primary-500 pl-1">Financial Documents</h3>
                <div>
                  <label for="fileUpload" class="cursor-pointer">
                    <Button 
                      icon="pi pi-upload" 
                      label="Upload" 
                      class="p-button-sm p-button-outlined p-button-primary"
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
              
              <!-- Empty state -->
              <div v-if="documents.length === 0" class="flex flex-col items-center justify-center py-12 slide-in-left">
                <i class="pi pi-file text-gray-300 text-5xl mb-4"></i>
                <h4 class="text-gray-500 font-medium text-sm mb-2">No documents found</h4>
                <p class="text-gray-400 text-xs text-center max-w-xs">Upload financial documents like receipts, statements, or contracts for easy access.</p>
              </div>
              
              <!-- Documents List -->
              <div v-else class="space-y-3 slide-in-left">
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
            </TabPanel>
          </TabPanels>
        </Tabs>
        
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
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const isLoading = ref(true)
const activeTabIndex = ref('0')

const userData = ref({
  fullName: 'Loading...',
  residenceName: 'Loading...',
  residencePhoto: null,
  unitNumber: ''
})

const transactions = ref([])

const invoices = ref([])

const documents = ref([])
const uploadPreviewVisible = ref(false)
const uploadFile = ref(null)
const uploadPreviewUrl = ref(null)
const isUploading = ref(false)
const fileInputRef = ref(null)
const customFileName = ref('')

// Function to go back to the previous page
const goBack = () => {
  router.go(-1)
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
    .then(({ data: { user } }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('Authenticated user ID:', user.id)
      
      // Create file path with custom name
      const fileExt = uploadFile.value.name.split('.').pop()
      const safeFileName = customFileName.value
        .replace(/[^a-zA-Z0-9_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF -]/g, '') // Remove special chars except dash and space
        .trim()
      
      const uniqueId = Math.random().toString(36).substring(2, 8)
      const fileName = `${uniqueId}_${safeFileName}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
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
              documentUserID: user.id,
              documentResidenceID: userData.value.residenceID,
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

const fetchDocuments = () => {
  supabase.auth.getUser()
    .then(({ data: { user } }) => {
      if (!user) return
      
      console.log('Fetching documents for user:', user.id)
      
      return supabase
        .from('Finance_Documents')
        .select('*')
        .eq('documentUserID', user.id)
        .order('created_at', { ascending: false })
    })
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

// Fetch user data
onMounted(() => {
  isLoading.value = true
  
  // Get user from auth store
  supabase.auth.getUser()
    .then(({ data: { user: authUser }, error: authError }) => {
      if (authError) throw authError
      
      if (!authUser) {
        throw new Error('No authenticated user found')
      }
      
      // Get user details
      return supabase
        .from('User')
        .select('userID, fullName, residenceID, unitNumber')
        .eq('userID', authUser.id)
        .single()
        .then(({ data: userData1, error: userError }) => {
          if (userError) throw userError
          
          if (!userData1) {
            throw new Error('User profile not found')
          }
          
          // Update user data
          userData.value.fullName = userData1.fullName
          userData.value.unitNumber = userData1.unitNumber
          userData.value.residenceID = userData1.residenceID
          
          return Promise.all([
            // Get residence details
            userData1.residenceID ? 
              supabase
                .from('Residence')
                .select('residenceName, displayPhotoUrl')
                .eq('residenceID', userData1.residenceID)
                .single() : 
              Promise.resolve({ data: null }),
            
            // Fetch transactions
            supabase
              .from('Transaction')
              .select('*')
              .eq('transactionUserID', authUser.id)
              .order('created_at', { ascending: false }),
            
            // Fetch invoices
            supabase
              .from('Invoice')
              .select('*')
              .eq('invoiceUserID', authUser.id)
              .eq('isPaid', false)
              .order('invoiceDueAt', { ascending: true })
          ])
        })
        .then(([residenceResponse, transactionResponse, invoiceResponse]) => {
          // Handle residence data
          const { data: residenceData, error: residenceError } = residenceResponse
          if (!residenceError && residenceData) {
            userData.value.residenceName = residenceData.residenceName
            userData.value.residencePhoto = residenceData.displayPhotoUrl
          }
          
          // Handle transaction data
          const { data: transactionData, error: transactionError } = transactionResponse
          if (transactionError) throw transactionError
          
          if (transactionData) {
            transactions.value = transactionData.map(transaction => ({
              id: transaction.transactionID,
              title: transaction.transactionTitle,
              description: transaction.transactionDescription,
              amount: `RM ${transaction.transactionAmount.toFixed(2)}`,
              date: new Date(transaction.created_at).toLocaleDateString('en-MY'),
              status: transaction.isLate ? 'Late' : 'Completed'
            }))
          }
          
          // Handle invoice data
          const { data: invoiceData, error: invoiceError } = invoiceResponse
          if (invoiceError) throw invoiceError
          
          if (invoiceData) {
            invoices.value = invoiceData.map(invoice => {
              const dueDate = new Date(invoice.invoiceDueAt)
              const today = new Date()
              const diffTime = Math.abs(dueDate - today)
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              return {
                id: invoice.invoiceID,
                title: invoice.invoiceTitle,
                description: invoice.invoiceDescription,
                amount: `RM ${invoice.invoiceAmount.toFixed(2)}`,
                dueDate: dueDate.toLocaleDateString('en-MY'),
                dueIn: diffDays === 1 ? '1 day' : `${diffDays} days`
              }
            })
          }
          
          // Fetch documents
          fetchDocuments()
          
          // Simulate minimum loading time for better UX
          return new Promise(resolve => setTimeout(resolve, 1000))
        })
    })
    .catch(error => {
      console.error('Error fetching data:', error)
      let errorMessage = 'Could not load financial data'
      
      if (error.message === 'No authenticated user found') {
        errorMessage = 'Please log in to view your financial data'
      } else if (error.message === 'User profile not found') {
        errorMessage = 'Your profile could not be found'
      }
      
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      })
    })
    .finally(() => {
      isLoading.value = false
    })
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

:deep(.p-selectbutton) {
  display: flex;
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-selectbutton .p-button) {
  flex: 1;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #4D5BBF;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

:deep(.p-selectbutton .p-button.p-highlight) {
  background-color: #4D5BBF;
  color: white;
  border-color: #4D5BBF;
}

:deep(.p-button.p-button-outlined) {
  color: #4D5BBF;
  border-color: #4D5BBF;
}

:deep(.p-button.p-button-outlined:hover) {
  background: rgba(77, 91, 191, 0.04);
}

:deep(.p-inputtext:focus) {
  border-color: #4D5BBF;
  box-shadow: 0 0 0 1px rgba(77, 91, 191, 0.2);
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

/* Custom Pay Button */
:deep(.custom-pay-button) {
  background-color: white !important;
  color: #4D5BBF !important;
  border: 1px solid #4D5BBF !important;
}

:deep(.custom-pay-button:hover) {
  background-color: white !important;
  color: #4D5BBF !important;
  border: 1px solid #4D5BBF !important;
  box-shadow: none !important;
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

.slide-in-left {
  animation: slide-in-from-left 0.5s ease-out forwards;
  opacity: 0;
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

/* List item hover animation */
.space-y-3 > div {
  transition: all 0.2s ease-in-out;
}

.space-y-3 > div:hover {
  transform: translateY(-2px);
}

/* Dialog custom styles */
:deep(.p-dialog-header) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
}

:deep(.p-dialog-mask) {
  backdrop-filter: blur(2px);
}

/* Upload button styling */
.p-button-primary {
  background-color: #4D5BBF !important;
  border-color: #4D5BBF !important;
}

.p-button-outlined.p-button-primary {
  color: #4D5BBF !important;
  border-color: #4D5BBF !important;
  background-color: transparent !important;
}

.p-button-outlined.p-button-primary:hover {
  background-color: rgba(77, 91, 191, 0.04) !important;
}

/* Document file item hover effect */
.space-y-3 > div {
  cursor: pointer;
}
</style>