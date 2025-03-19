<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#4D5BBF]">Financial Management</h1>
      <p class="text-gray-600 mt-2">Manage all financial transactions and invoices</p>
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

      <div v-if="activeTab === 'Transactions'">
        <DataTable
            :value="transactions"
            :paginator="true"
            :rows="5"
            :loading="loading"
            v-model:filters="filters"
            responsiveLayout="scroll"
            class="p-datatable-lg border-t border-gray-200"
            >
            <Column field="transactionID" header="ID" sortable></Column>
            <Column field="transactionTitle" header="Title" sortable></Column>
            <Column field="transactionUserID" header="User ID" sortable></Column>
            <Column field="transactionAmount" header="Amount" sortable>
                <template #body="{ data }">
                <span :class="{
                    'px-3 py-1 rounded-full': true,
                    'bg-green-100 text-green-800': data.transactionAmount >= 0,
                    'bg-red-100 text-red-800': data.transactionAmount < 0
                }">
                    {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.transactionAmount) }}
                </span>
                </template>
            </Column>
            <Column field="transactionCreatedAt" header="Created At" sortable>
                <template #body="{ data }">
                <div class="flex items-center gap-2">
                    <i class="pi pi-calendar text-primary-500"></i>
                    {{ new Date(data.created_at).toLocaleDateString() }}
                </div>
                </template>
            </Column>
            </DataTable>
      </div>

      <div v-if="activeTab === 'Invoices'">
        <DataTable
          :value="invoices"
          :paginator="true"
          :rows="10"
          :loading="loading"
          removableSort
          v-model:sortField="sortField"
          v-model:sortOrder="sortOrder"
          dataKey="id"
          :rowHover="true"
          responsiveLayout="scroll"
          class="p-datatable-lg border-t border-gray-200"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5,10,25,50]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        >
          <Column field="created_at" header="Date" sortable>
            <template #body="{ data }">
              {{ new Date(data.created_at).toLocaleDateString() }}
            </template>
          </Column>
          <Column field="invoiceTitle" header="Title" sortable></Column>
          <Column field="invoiceAmount" header="Amount" sortable>
            <template #body="{ data }">
              {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.invoiceAmount) }}
            </template>
          </Column>
          <Column field="invoiceDescription" header="Description" sortable></Column>
          <Column field="invoiceDueAt" header="Due Date" sortable>
            <template #body="{ data }">
              {{ new Date(data.invoiceDueAt).toLocaleDateString() }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
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

const viewDetails = (data) => {
  console.log('View details:', data)
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
      .select('*')
      .in('transactionUserID', userIds)

    if (transactionsError) throw transactionsError
    transactions.value = transactionsData

    // Fetch invoices for these users
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('Invoice')
      .select('*')
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

.card {
  @apply bg-white rounded-lg shadow-sm;
}

/* PrimeVue Dialog Custom Styles */
:deep(.user-details-dialog) {
  @apply rounded-lg overflow-hidden;
}

:deep(.user-details-dialog .p-dialog-header) {
  @apply bg-primary-50 border-b border-primary-100 px-6 py-4;
}

:deep(.user-details-dialog .p-dialog-content) {
  @apply p-6;
}

:deep(.user-details-dialog .p-dialog-footer) {
  @apply p-4 bg-gray-50 border-t border-gray-100;
}

:deep(.user-details-dialog .p-dialog-title) {
  @apply text-lg font-semibold text-primary-700;
}

/* Animation classes provided by PrimeVue */
:deep(.p-dialog-enter-active) {
  transition: all 0.3s ease-out;
}

:deep(.p-dialog-leave-active) {
  transition: all 0.2s ease-in;
}

:deep(.p-dialog-enter-from),
:deep(.p-dialog-leave-to) {
  opacity: 0;
  transform: translateY(-50px);
}

:deep(.p-dialog-enter-to),
:deep(.p-dialog-leave-from) {
  opacity: 1;
  transform: translateY(0);
}

/* Mask animation */
:deep(.p-dialog-mask.p-component-overlay-enter) {
  animation: dialog-mask-in 0.2s;
}

:deep(.p-dialog-mask.p-component-overlay-leave-to) {
  animation: dialog-mask-out 0.2s;
}

@keyframes dialog-mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialog-mask-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
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