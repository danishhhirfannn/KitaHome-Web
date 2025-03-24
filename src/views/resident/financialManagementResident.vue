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
          <h2 class="text-md font-semibold text-white tracking-wider">Finance</h2>
        </div>
        <div class="w-10"></div> <!-- Empty div for balanced spacing -->
      </div>

      <!-- Content Section -->
      <div class="min-h-screen bg-white p-4 sm:p-6 rounded-tl-3xl rounded-tr-3xl shadow-lg content-scale-in">
        <!-- Tab Navigation -->
        <Tabs v-model:value="activeTabIndex" class="mb-6">
          <TabList>
            <Tab value="0">Pending Invoices</Tab>
            <Tab value="1">Payment History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0" class="tab-panel">
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

const transactions = ref([
  {
    id: 'TR001',
    title: 'Monthly Maintenance Fee',
    description: 'Payment for June 2024 maintenance',
    amount: 'RM 150.00',
    date: '01/06/2024',
    status: 'Completed'
  },
  {
    id: 'TR002',
    title: 'Parking Fee',
    description: 'Additional parking slot fee',
    amount: 'RM 50.00',
    date: '15/05/2024',
    status: 'Completed'
  },
  {
    id: 'TR003',
    title: 'Special Assessment',
    description: 'Building facade renovation contribution',
    amount: 'RM 200.00',
    date: '05/05/2024',
    status: 'Completed'
  }
])

const invoices = ref([
  {
    id: 'INV001',
    title: 'Monthly Maintenance Fee',
    description: 'Payment for July 2024 maintenance',
    amount: 'RM 150.00',
    dueDate: '01/07/2024',
    dueIn: '5 days'
  },
  {
    id: 'INV002',
    title: 'Special Assessment',
    description: 'Swimming pool maintenance fee',
    amount: 'RM 100.00',
    dueDate: '15/07/2024',
    dueIn: '20 days'
  }
])

// Function to go back to the previous page
const goBack = () => {
  router.go(-1)
}

// Fetch user data
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Get user from auth store
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) throw authError
    
    if (!authUser) {
      throw new Error('No authenticated user found')
    }
    
    // Get user details
    const { data: userData1, error: userError } = await supabase
      .from('User')
      .select('userID, fullName, residenceID, unitNumber')
      .eq('userID', authUser.id)
      .single()
      
    if (userError) throw userError
    
    if (!userData1) {
      throw new Error('User profile not found')
    }
    
    // Update user data
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

    // Fetch transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('Transaction')
      .select('*')
      .eq('transactionUserID', authUser.id)
      .order('created_at', { ascending: false })

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

    // Fetch invoices
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('Invoice')
      .select('*')
      .eq('invoiceUserID', authUser.id)
      .eq('isPaid', false)
      .order('invoiceDueAt', { ascending: true })

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
    
    // Simulate minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } catch (error) {
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
</style>