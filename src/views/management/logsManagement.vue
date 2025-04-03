<template>
  <Toast position="top-right" />
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#4D5BBF]">Activity Logs</h1>
      <p class="text-gray-600 mt-2">View user action logs for your residence</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
      <div class="flex flex-wrap gap-6 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <Calendar v-model="dateRange" selectionMode="range" dateFormat="yy-mm-dd" 
            placeholder="Select date range" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
          <Dropdown v-model="selectedAction" :options="actionTypes" optionLabel="name" 
            optionValue="value" placeholder="All actions" class="w-40" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">User</label>
          <Dropdown v-model="selectedUser" :options="managementUsers" optionLabel="fullName"
            optionValue="userID" placeholder="All users" class="w-64" />
        </div>
        <div>
          <Button label="Apply Filters" icon="pi pi-filter" @click="applyFilters" />
        </div>
        <div>
          <Button label="Reset" text class="text-gray-600" @click="resetFilters" />
        </div>
        <div>
          <Button label="Create Test Log" severity="secondary" @click="testLogEntry" />
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center"> 
        <h2 class="text-xl font-semibold text-[#4D5BBF]">Activity Logs</h2>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              placeholder="Search logs..." 
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>

      <DataTable
        :value="logs"
        :paginator="true"
        :rows="10"
        :loading="loading"
        v-model:filters="filters"
        responsiveLayout="scroll"
        class="p-datatable-lg border-t border-gray-200"
      >
        <Column field="created_at" header="Date & Time" sortable>
          <template #body="{ data }">
            <span class="text-gray-700 flex flex-col">
              <span>{{ new Date(data.created_at).toLocaleDateString() }}</span>
              <span class="text-gray-700">{{ new Date(data.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
            </span>
          </template>
        </Column>
        <Column field="User.fullName" header="User" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ data.User?.fullName?.charAt(0).toUpperCase() || '?' }}
              </div>
              {{ data.User?.fullName || 'Unknown User' }}
            </div>
          </template>
        </Column>
        <Column field="action" header="Action" sortable>
          <template #body="{ data }">
            <span :class="{
              'px-3 py-1 rounded-full': true,
              'bg-red-100 text-red-800': data.action === 'delete',
              'bg-green-100 text-green-800': ['create', 'verify', 'approve'].includes(data.action),
              'bg-blue-100 text-blue-800': ['update', 'view', 'assign', 'send'].includes(data.action),
              'bg-yellow-100 text-yellow-800': data.action === 'reject'
            }">
              {{ data.action }}
            </span>
          </template>
        </Column>
        <Column field="description" header="Description" style="min-width: 300px">
          <template #body="{ data }">
            <span class="text-gray-700">{{ data.description }}</span>
          </template>
        </Column>
        <Column field="targetTable" header="Entity" sortable>
          <template #body="{ data }">
            <span class="text-gray-700">{{ formatEntityName(data.targetTable) }}</span>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex justify-center">
              <Button 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-text p-button-sm text-primary-600"
                @click="showDetails(slotProps.data)"
                tooltip="View Details"
                tooltipOptions="top"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- Log Details Dialog -->
  <Dialog 
    v-model:visible="detailsDialog" 
    :header="'Log Details'" 
    :style="{width: '60vw'}"
    :modal="true"
    :closable="true"
    :dismissableMask="true"
    class="log-dialog"
  >
    <div v-if="selectedLog" class="p-4">
      <!-- Log header -->
      <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
        <div class="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-700 font-semibold text-lg">
          {{ selectedLog.User?.fullName?.charAt(0).toUpperCase() || '?' }}
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-800">{{ selectedLog.description }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-gray-600">{{ selectedLog.User?.fullName || 'Unknown User' }}</span>
            <span class="text-gray-400">•</span>
            <span :class="{
              'px-2 py-0.5 rounded-full text-sm': true,
              'bg-red-100 text-red-800': selectedLog.action === 'delete',
              'bg-green-100 text-green-800': ['create', 'verify', 'approve'].includes(selectedLog.action),
              'bg-blue-100 text-blue-800': ['update', 'view', 'assign', 'send'].includes(selectedLog.action),
              'bg-yellow-100 text-yellow-800': selectedLog.action === 'reject'
            }">
              {{ selectedLog.action }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Log details -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="rounded-lg shadow-sm p-3 border bg-gray-50 border-gray-100">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-medium text-gray-500">Date</div>
              <div class="text-md font-bold mt-1 text-gray-700">
                {{ new Date(selectedLog.created_at).toLocaleDateString() }}
              </div>
              <div class="text-sm text-gray-600">
                {{ new Date(selectedLog.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
              </div>
            </div>
            <div class="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
              <i class="pi pi-calendar text-sm"></i>
            </div>
          </div>
        </div>
        
        <div class="rounded-lg shadow-sm p-3 border bg-gray-50 border-gray-100">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-medium text-gray-500">Entity</div>
              <div class="text-md font-bold mt-1 text-gray-700">
                {{ formatEntityName(selectedLog.targetTable) || 'System' }}
              </div>
              <div class="text-sm text-gray-600 truncate max-w-[150px]" :title="selectedLog.targetID">
                ID: {{ selectedLog.targetID ? selectedLog.targetID.substring(0,10) + '...' : 'N/A' }}
              </div>
            </div>
            <div class="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
              <i class="pi pi-table text-sm"></i>
            </div>
          </div>
        </div>
        
        <div :class="{
          'rounded-lg shadow-sm p-3 border': true,
          'bg-red-50 border-red-100': selectedLog.action === 'delete',
          'bg-green-50 border-green-100': ['create', 'verify', 'approve'].includes(selectedLog.action),
          'bg-blue-50 border-blue-100': ['update', 'view', 'assign', 'send'].includes(selectedLog.action),
          'bg-yellow-50 border-yellow-100': selectedLog.action === 'reject',
          'bg-gray-50 border-gray-100': !['delete', 'create', 'verify', 'approve', 'update', 'view', 'assign', 'send', 'reject'].includes(selectedLog.action)
        }">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-xs font-medium text-gray-500">Action</div>
              <div :class="{
                'text-md font-bold mt-1': true,
                'text-red-700': selectedLog.action === 'delete',
                'text-green-700': ['create', 'verify', 'approve'].includes(selectedLog.action),
                'text-blue-700': ['update', 'view', 'assign', 'send'].includes(selectedLog.action),
                'text-yellow-700': selectedLog.action === 'reject',
                'text-gray-700': !['delete', 'create', 'verify', 'approve', 'update', 'view', 'assign', 'send', 'reject'].includes(selectedLog.action)
              }">
                {{ selectedLog.action }}
              </div>
            </div>
            <div :class="{
              'h-8 w-8 rounded-full flex items-center justify-center': true,
              'bg-red-100 text-red-700': selectedLog.action === 'delete',
              'bg-green-100 text-green-700': ['create', 'verify', 'approve'].includes(selectedLog.action),
              'bg-blue-100 text-blue-700': ['update', 'view', 'assign', 'send'].includes(selectedLog.action),
              'bg-yellow-100 text-yellow-700': selectedLog.action === 'reject',
              'bg-gray-100 text-gray-700': !['delete', 'create', 'verify', 'approve', 'update', 'view', 'assign', 'send', 'reject'].includes(selectedLog.action)
            }">
              <i :class="{
                'pi text-sm': true,
                'pi-trash': selectedLog.action === 'delete',
                'pi-plus-circle': selectedLog.action === 'create',
                'pi-check-circle': ['verify', 'approve'].includes(selectedLog.action),
                'pi-pencil': selectedLog.action === 'update',
                'pi-eye': selectedLog.action === 'view',
                'pi-link': selectedLog.action === 'assign',
                'pi-send': selectedLog.action === 'send',
                'pi-times-circle': selectedLog.action === 'reject',
                'pi-info-circle': !['delete', 'create', 'verify', 'approve', 'update', 'view', 'assign', 'send', 'reject'].includes(selectedLog.action)
              }"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional metadata -->
      <div v-if="selectedLog.metadata" class="mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <i class="pi pi-info-circle mr-2 text-primary-500"></i> Additional Data
        </h3>
        
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 class="font-medium text-gray-700">Metadata</h4>
          </div>
          <div class="p-4">
            <pre class="text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[300px]">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined p-button-secondary" 
          @click="detailsDialog = false"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { logService } from '@/api/logService'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'

// Import PrimeVue components
import Toast from 'primevue/toast'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

const toast = useToast()
const authStore = useAuthStore()

// Data
const logs = ref([])
const loading = ref(false)
const detailsDialog = ref(false)
const selectedLog = ref(null)
const managementUsers = ref([])
const dateRange = ref(null)
const selectedAction = ref(null)
const selectedUser = ref(null)
const filters = ref({
  global: { value: '' }
})

// Constants
const actionTypes = [
  { name: 'All actions', value: null },
  { name: 'Create', value: 'create' },
  { name: 'Update', value: 'update' },
  { name: 'Delete', value: 'delete' },
  { name: 'Verify', value: 'verify' },
  { name: 'Assign', value: 'assign' },
  { name: 'Approve', value: 'approve' },
  { name: 'Reject', value: 'reject' },
  { name: 'Send', value: 'send' }
]

// Methods
const fetchLogs = async () => {
  try {
    loading.value = true
    const { success, data, error } = await logService.getLogs()
    
    if (!success) throw new Error(error)
    
    logs.value = data
  } catch (error) {
    console.error('Error fetching logs:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch logs',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const fetchManagementUsers = async () => {
  try {
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

    // Get management users from the same residence
    const { data, error } = await supabase
      .from('User')
      .select('userID, fullName')
      .eq('residenceID', currentUser.residenceID)
      .eq('isManagement', true)
      .order('fullName')

    if (error) throw error
    
    managementUsers.value = [{ userID: null, fullName: 'All users' }, ...data]
  } catch (error) {
    console.error('Error fetching management users:', error)
  }
}

const showDetails = (log) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatEntityName = (entityName) => {
  if (!entityName) return 'System'
  
  // Format camelCase or snake_case to Title Case
  return entityName
    .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize the first letter
    .trim()
}

const getActionSeverity = (action) => {
  const severityMap = {
    create: 'success',
    update: 'info',
    delete: 'danger',
    verify: 'success',
    approve: 'success',
    reject: 'warning',
    assign: 'info',
    send: 'info',
    view: 'secondary'
  }
  
  return severityMap[action] || 'info'
}

const applyFilters = async () => {
  try {
    loading.value = true
    
    let query = supabase
      .from('logs')
      .select(`
        *,
        User:userID (
          fullName,
          email
        )
      `)
    
    // Get user's residence ID
    const { data: currentUser, error: currentUserError } = await supabase
      .from('User')
      .select('residenceID')
      .eq('userID', authStore.user.id)
      .single()

    if (currentUserError) throw currentUserError
    query = query.eq('residenceID', currentUser.residenceID)
    
    // Apply action filter
    if (selectedAction.value) {
      query = query.eq('action', selectedAction.value)
    }
    
    // Apply user filter
    if (selectedUser.value) {
      query = query.eq('userID', selectedUser.value)
    }
    
    // Apply date range filter
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      const startDate = new Date(dateRange.value[0])
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(dateRange.value[1])
      endDate.setHours(23, 59, 59, 999)
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    logs.value = data
  } catch (error) {
    console.error('Error applying filters:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to apply filters',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  dateRange.value = null
  selectedAction.value = null
  selectedUser.value = null
  fetchLogs()
}

const testLogEntry = async () => {
  try {
    const result = await logService.logAction({
      action: 'test',
      description: 'This is a test log entry',
      targetTable: 'logs',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    })
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Test Log Created',
        detail: 'Successfully created a test log entry',
        life: 3000
      })
      
      // Refresh logs
      fetchLogs()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Test Failed',
        detail: result.error || 'Failed to create test log entry',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error creating test log:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error creating test log entry',
      life: 3000
    })
  }
}

// Lifecycle hooks
onMounted(async () => {
  fetchLogs()
  fetchManagementUsers()
})
</script>

<style scoped>
/* PrimeVue customizations */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-primary-50 text-primary-700 font-semibold;
}

:deep(.p-datatable-header) {
  background-color: transparent;
  border: none;
  padding: 1.5rem;
}

:deep(.p-column-header-content) {
  justify-content: flex-start;
}

.p-button.p-button-text:hover {
  background: rgba(var(--primary-500), 0.04);
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  @apply bg-primary-500;
}

:deep(.p-inputswitch:not(.p-disabled):hover .p-inputswitch-slider) {
  @apply bg-primary-600;
}

:deep(.p-dialog .p-dialog-header) {
  @apply bg-primary-50 text-primary-800 font-bold;
}
</style> 