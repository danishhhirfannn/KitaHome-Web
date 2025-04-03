<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="flex justify-between items-center">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#4D5BBF]">Financial Management</h1>
        <p class="text-gray-600 mt-2">Manage all financial transactions and invoices</p>
      </div>
        <Button
        icon="pi pi-cog" 
        label="Configure Automation"
        raised
        class="text-sm"
        @click="viewDetails(slotProps.data)"
        tooltip="View Details"
        tooltipOptions="top" />
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <SelectButton v-model="activeTab" :options="tabs" />
        </div>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              :placeholder="`Search ${activeTab.toLowerCase()}...`"
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>

      <div class="transition-wrapper">
        <Transition name="fade-slide" mode="out-in">
          <div v-if="activeTab === 'Transactions'" key="transactions">
            <DataTable
              :value="transactions"
              :paginator="true"
              :rows="10"
              :loading="loading"
              v-model:filters="filters"
              responsiveLayout="scroll"
              class="p-datatable-lg border-t border-gray-200"
            >
              <Column field="transactionID" header="Transaction ID" sortable></Column>
              <Column field="transactionTitle" header="Transaction Title" sortable></Column>
              <Column field="User.fullName" header="Resident" sortable>
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      {{ data.User?.fullName?.charAt(0).toUpperCase() }}
                    </div>
                    {{ data.User?.fullName || 'Unknown User' }}
                  </div>
                </template>
              </Column>
              <Column field="transactionAmount" header="Amount" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-primary-100 text-primary-500': data.transactionAmount >= 0,
                    'bg-red-100 text-red-800': data.transactionAmount < 0
                  }">
                    {{ new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(data.transactionAmount) }}
                  </span>
                </template>
              </Column>
              <Column field="transactionCreatedAt" header="Paid On" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {{ new Date(data.created_at).toLocaleDateString() }}
                    </span>
                    <span class="">
                      {{ new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="isLate" header="Due Status" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full inline-flex justify-center items-center': true,
                    'text-red-800': data.isLate,
                    'text-green-800': !data.isLate
                  }">
                    {{ data.isLate ? 'Late' : 'On Time' }}
                  </span>
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <Button 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-text p-button-sm text-primary-600"
                      @click="viewDetails(slotProps.data)"
                      tooltip="View Details"
                      tooltipOptions="top"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else-if="activeTab === 'Invoices'" key="invoices">
            <DataTable
              :value="invoices"
              :paginator="true"
              :rows="10"
              :loading="loading"
              v-model:filters="filters"
              responsiveLayout="scroll"
              class="p-datatable-lg border-t border-gray-200"
            >
              <Column field="invoiceID" header="Invoice ID" sortable></Column>
              <Column field="invoiceTitle" header="Title" sortable></Column>
              <Column field="User.fullName" header="Resident" sortable>
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      {{ data.User?.fullName?.charAt(0).toUpperCase() }}
                    </div>
                    {{ data.User?.fullName || 'Unknown User' }}
                  </div>
                </template>
              </Column>
              <Column field="invoiceAmount" header="Amount" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-primary-100 text-primary-500': data.invoiceAmount >= 0,
                    'bg-red-100 text-red-800': data.invoiceAmount < 0
                  }">
                    {{ new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(data.invoiceAmount) }}
                  </span>
                </template>
              </Column>
              <Column field="invoiceDueAt" header="Due Date" sortable>
                <template #body="{ data }">
                  <div class="flex flex-col">
                    <span class="font-medium">
                      {{ new Date(data.invoiceDueAt).toLocaleDateString() }}
                    </span>
                    <span class="">
                      {{ new Date(data.invoiceDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="isPaid" header="Payment Status" sortable>
                <template #body="{ data }">
                  <span :class="{
                    'px-3 py-1 rounded-full inline-flex justify-center items-center': true,
                    'text-green-800': data.isPaid,
                    'text-yellow-800': !data.isPaid
                  }">
                    {{ data.isPaid ? 'Paid' : 'Pending' }}
                  </span>
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <Button 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-text p-button-sm text-primary-600"
                      @click="viewDetails(slotProps.data)"
                      tooltip="View Details"
                      tooltipOptions="top"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <Dialog 
    v-model:visible="sidebarVisible" 
    :modal="true"
    :header="activeTab === 'Transactions' ? 'Transaction Details' : 'Invoice Details'"
    :style="{width: '30rem'}"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}"
    class="shadow-lg rounded-lg overflow-hidden"
    :closable="true"
    @hide="closeSidebar"
  >
    <div v-if="selectedItem" class="p-1 space-y-6">
      <!-- ID Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium text-gray-500">
          {{ activeTab === 'Transactions' ? 'Transaction ID' : 'Invoice ID' }}
        </h3>
        <p class="mt-1 text-sm text-gray-800">{{ selectedItem.transactionID }}</p>
      </div>

      <!-- Title Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Title</h3>
        <p class="mt-1 text-base font-medium text-gray-800">{{ selectedItem[`${activeTab.toLowerCase().slice(0, -1)}Title`] }}</p>
      </div>

      <!-- Resident Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Resident</h3>
        <div class="flex items-center gap-3 mt-2">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg shadow-sm">
            {{ selectedItem.User?.fullName?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <span class="text-base font-medium text-gray-800">{{ selectedItem.User?.fullName || 'Unknown User' }}</span>
            <p class="text-xs text-gray-500">Resident</p>
          </div>
        </div>
      </div>

      <!-- Amount Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Amount</h3>
        <p class="mt-1 text-xl font-bold" :class="{
          'text-primary-600': selectedItem[`${activeTab.toLowerCase().slice(0, -1)}Amount`] >= 0,
          'text-red-600': selectedItem[`${activeTab.toLowerCase().slice(0, -1)}Amount`] < 0
        }">
          {{ new Intl.NumberFormat('en-MY', { 
            style: 'currency', 
            currency: 'MYR' 
          }).format(selectedItem[`${activeTab.toLowerCase().slice(0, -1)}Amount`]) }}
        </p>
      </div>

      <!-- Status Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Status</h3>
        <div class="mt-2">
          <!-- For Transactions -->
          <span v-if="activeTab === 'Transactions'" :class="{
            'px-3 py-1.5 rounded-full inline-flex items-center text-sm font-medium': true,
            'bg-red-100 text-red-800': selectedItem.isLate,
            'bg-green-100 text-green-800': !selectedItem.isLate
          }">
            <span v-if="selectedItem.isLate" class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            <span v-else class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            {{ selectedItem.isLate ? 'Late' : 'On Time' }}
          </span>
          <!-- For Invoices -->
          <span v-else :class="{
            'px-3 py-1.5 rounded-full inline-flex items-center text-sm font-medium': true,
            'bg-green-100 text-green-800': selectedItem.isPaid,
            'bg-yellow-100 text-yellow-800': !selectedItem.isPaid
          }">
            <span v-if="selectedItem.isPaid" class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <span v-else class="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            {{ selectedItem.isPaid ? 'Paid' : 'Pending' }}
          </span>
        </div>
      </div>

      <!-- Date Section -->
      <div class="border-b border-gray-100 pb-4">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">
          {{ activeTab === 'Transactions' ? 'Transaction Date' : 'Due Date' }}
        </h3>
        <div class="mt-2 flex items-center">
          <div class="mr-3 p-2 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-base font-medium text-gray-800">
              {{ new Date(activeTab === 'Transactions' ? selectedItem.created_at : selectedItem.invoiceDueAt).toLocaleDateString() }}
            </p>
            <p class="text-xs text-gray-500">
              {{ new Date(activeTab === 'Transactions' ? selectedItem.created_at : selectedItem.invoiceDueAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div v-if="selectedItem.description" class="pb-2">
        <h3 class="text-xs font-medium uppercase tracking-wide text-gray-500">Description</h3>
        <p class="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{{ selectedItem.description }}</p>
      </div>
    </div>

    <template #footer>
      <div class="py-3 flex justify-end">
        <Button 
          label="View Invoice" 
          icon="pi pi-receipt" 
          class="text-sm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import SelectButton from 'primevue/selectbutton'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { logService } from '@/api/logService'

const toast = useToast()
const authStore = useAuthStore()
const loading = ref(true)
const transactions = ref([])
const invoices = ref([])
const activeTab = ref('Transactions')
const tabs = ['Transactions', 'Invoices']

const sortField = ref('created_at')
const sortOrder = ref(-1)

const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const sidebarVisible = ref(false)
const selectedItem = ref(null)

const viewDetails = (data) => {
  selectedItem.value = data
  sidebarVisible.value = true
}

const closeSidebar = () => {
  sidebarVisible.value = false
  selectedItem.value = null
}

const fetchFinancialData = async () => {
  try {
    loading.value = true

    // First, get the current user's residenceID
    const { data: currentUser, error: currentUserError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()

    if (currentUserError) throw currentUserError
    if (!currentUser?.residenceID) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No residence assigned to current user',
        life: 3000
      })
      return
    }

    // Fetch users with the same residenceID
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('userID')
      .eq('residenceID', currentUser.residenceID)

    if (usersError) throw usersError
    const userIds = users.map(user => user.userID)

    // Fetch transactions for these users
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('Transaction')
      .select(`
        *,
        User:transactionUserID (
          fullName
        ),
        isLate
      `)
      .in('transactionUserID', userIds)

    if (transactionsError) throw transactionsError
    transactions.value = transactionsData

    // Fetch invoices for these users
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('Invoice')
      .select(`
        *,
        User:invoiceUserID (
          fullName
        ),
        isPaid
      `)
      .in('invoiceUserID', userIds)

    if (invoicesError) throw invoicesError
    invoices.value = invoicesData

  } catch (error) {
    console.error('Error fetching financial data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch financial data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const createInvoice = async () => {
  try {
    saving.value = true
    
    // Create the invoice
    const { data, error } = await supabase
      .from('Invoice')
      .insert({
        // your invoice data here
        ...invoiceForm.value
      })
      .select('*')
      .single()
    
    if (error) throw error
    
    // Log invoice creation
    await logService.logAction({
      action: 'create',
      description: `Created invoice: ${invoiceForm.value.description || 'New Invoice'} for ${invoiceForm.value.amount}`,
      targetTable: 'Invoice',
      targetID: data.invoiceID,
      metadata: {
        amount: invoiceForm.value.amount,
        description: invoiceForm.value.description,
        dueDate: invoiceForm.value.dueDate
      }
    })
    
    // Your existing success handling
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invoice created successfully',
      life: 3000
    })
    
    // Your existing form reset and refresh
    
  } catch (error) {
    console.error('Error creating invoice:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create invoice',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const updateInvoiceStatus = async (invoiceId, newStatus) => {
  try {
    // Get current invoice for logging
    const { data: invoiceData, error: fetchError } = await supabase
      .from('Invoice')
      .select('*')
      .eq('invoiceID', invoiceId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Update status
    const { error } = await supabase
      .from('Invoice')
      .update({ status: newStatus })
      .eq('invoiceID', invoiceId)
    
    if (error) throw error
    
    // Log status update
    await logService.logAction({
      action: 'update',
      description: `Updated invoice status to '${newStatus}' for invoice ${invoiceData.description || 'Invoice'} (${invoiceData.amount})`,
      targetTable: 'Invoice',
      targetID: invoiceId,
      metadata: {
        previousStatus: invoiceData.status,
        newStatus: newStatus
      }
    })
    
    // Your existing success handling
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Invoice status updated to ${newStatus}`,
      life: 3000
    })
    
    // Your existing refresh logic
    
  } catch (error) {
    console.error('Error updating invoice status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update invoice status',
      life: 3000
    })
  }
}

// Function to mark an invoice as paid
const markInvoiceAsPaid = async (invoice) => {
  try {
    loading.value = true;
    
    // Update the invoice status to paid
    const { data, error } = await supabase
      .from('Invoice')
      .update({ 
        isPaid: true,
        paidAt: new Date().toISOString()
      })
      .eq('invoiceID', invoice.invoiceID)
      .select();
      
    if (error) throw error;
    
    // Log the payment action
    await logService.logAction({
      action: 'update',
      description: `Marked invoice as paid: ${invoice.invoiceTitle || 'Invoice'}`,
      targetTable: 'Invoice',
      targetID: invoice.invoiceID,
      metadata: {
        invoiceTitle: invoice.invoiceTitle,
        amount: invoice.invoiceAmount,
        paidAt: new Date().toISOString(),
        previousStatus: 'pending',
        newStatus: 'paid',
        residentName: invoice.User?.fullName || 'Unknown Resident'
      }
    });
    
    // Create a transaction record for this payment
    const { data: transactionData, error: transactionError } = await supabase
      .from('Transaction')
      .insert({
        transactionUserID: invoice.invoiceUserID,
        transactionTitle: `Payment for ${invoice.invoiceTitle || 'Invoice'}`,
        transactionAmount: invoice.invoiceAmount,
        transactionDescription: `Payment for invoice #${invoice.invoiceID}`,
        invoiceID: invoice.invoiceID
      })
      .select();
      
    if (transactionError) throw transactionError;
    
    // Log the transaction creation
    await logService.logAction({
      action: 'create',
      description: `Created transaction record for invoice payment: ${invoice.invoiceTitle || 'Invoice'}`,
      targetTable: 'Transaction',
      targetID: transactionData[0].transactionID,
      metadata: {
        transactionTitle: `Payment for ${invoice.invoiceTitle || 'Invoice'}`,
        amount: invoice.invoiceAmount,
        invoiceID: invoice.invoiceID,
        residentName: invoice.User?.fullName || 'Unknown Resident'
      }
    });
    
    // Update local state
    const index = invoices.value.findIndex(inv => inv.invoiceID === invoice.invoiceID);
    if (index !== -1) {
      invoices.value[index].isPaid = true;
      invoices.value[index].paidAt = new Date().toISOString();
    }
    
    // If this is the selected item, update it too
    if (selectedItem.value && selectedItem.value.invoiceID === invoice.invoiceID) {
      selectedItem.value.isPaid = true;
      selectedItem.value.paidAt = new Date().toISOString();
    }
    
    // Refresh the transactions list
    await fetchFinancialData();
    
    toast.add({
      severity: 'success',
      summary: 'Payment Recorded',
      detail: 'Invoice has been marked as paid and transaction created',
      life: 3000
    });
    
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process payment',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Function to create a manual transaction
const createManualTransaction = async (transactionData) => {
  try {
    loading.value = true;
    
    // Create the transaction
    const { data, error } = await supabase
      .from('Transaction')
      .insert({
        transactionUserID: transactionData.userID,
        transactionTitle: transactionData.title,
        transactionAmount: transactionData.amount,
        transactionDescription: transactionData.description,
        isManual: true
      })
      .select();
      
    if (error) throw error;
    
    // Log the manual transaction creation
    await logService.logAction({
      action: 'create',
      description: `Created manual transaction: ${transactionData.title}`,
      targetTable: 'Transaction',
      targetID: data[0].transactionID,
      metadata: {
        transactionTitle: transactionData.title,
        amount: transactionData.amount,
        isManual: true,
        residentID: transactionData.userID,
        reason: transactionData.description
      }
    });
    
    // Refresh the transactions list
    await fetchFinancialData();
    
    toast.add({
      severity: 'success',
      summary: 'Transaction Created',
      detail: 'Manual transaction has been recorded successfully',
      life: 3000
    });
    
    return data[0];
  } catch (error) {
    console.error('Error creating manual transaction:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create transaction',
      life: 3000
    });
    return null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFinancialData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-primary-50 text-primary-700 font-semibold;
}

:deep(.p-button.p-button-text) {
  @apply text-primary-600;
}

:deep(.p-button.p-button-text:hover) {
  @apply bg-primary-50;
}

:deep(.p-paginator) {
  @apply bg-transparent;
}

:deep(.p-inputtext:focus) {
  @apply border-primary-500 ring-1 ring-primary-200;
}

.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
  @apply bg-primary-50/30;
}

.p-datatable .p-datatable-tbody > tr:hover {
  @apply bg-primary-50/50;
}

/* Content transition animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Add this wrapper style */
.transition-wrapper {
  position: relative;
  min-height: 300px;
  overflow: hidden;
}
</style>