<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#4D5BBF]">Profile Management</h1>
      <p class="text-gray-600 mt-2">Manage all user profiles and their verification status</p>
    </div>

    <div class="card bg-white rounded-lg shadow border border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-[#4D5BBF]">User Profiles</h2>
        <div class="flex space-x-2">
          <span class="p-input-icon-left relative" style="min-width: 250px;">
            <InputText 
              v-model="filters.global.value" 
              placeholder="Search users..." 
              class="p-inputtext-sm border-primary-200 focus:border-primary-500 w-full pl-10" 
            />
          </span>
        </div>
      </div>
      
      <DataTable
        :value="users"
        :paginator="true"
        :rows="5"
        :loading="loading"
        v-model:filters="filters"
        filterDisplay="menu"
        responsiveLayout="scroll"
        class="p-datatable-lg border-t border-gray-200"
      >
        <Column field="fullName" header="Name" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {{ data.fullName.charAt(0).toUpperCase() }}
              </div>
              {{ data.fullName }}
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="phone" header="Phone"></Column>
        <Column field="residenceID" header="Residence ID" sortable></Column>
        <Column field="unitNumber" header="Unit"></Column>
        <Column header="Roles">
          <template #body="slotProps">
            <div class="flex gap-2">
              <span v-if="slotProps.data.isAdmin" 
                class="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700 w-full inline-flex justify-center items-center">
                Admin
              </span>
              <span v-if="slotProps.data.isManagement" 
                class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 w-full inline-flex justify-center items-center">
                Management
              </span>
              <span v-if="slotProps.data.isResident" 
                class="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 w-full inline-flex justify-center items-center">
                Resident
              </span>
            </div>
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            <span :class="{
              'px-2 py-1 text-xs rounded-full': true,
              'bg-green-100 text-green-800 w-full inline-flex justify-center items-center': slotProps.data.isVerified,
              'bg-red-100 text-red-800 w-full inline-flex justify-center items-center': slotProps.data.isDeclined,
              'bg-yellow-100 text-yellow-800 w-full inline-flex justify-center items-center': !slotProps.data.isVerified && !slotProps.data.isDeclined
            }">
              {{ slotProps.data.isVerified ? 'Verified' : slotProps.data.isDeclined ? 'Declined' : 'Pending' }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const users = ref([])
const loading = ref(true)
const selectedUser = ref(null)
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

const fetchUsers = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('fullName')

    if (error) throw error
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const viewDetails = (user) => {
  // Implement view details functionality
  console.log('View details for user:', user)
}

const onRowSelect = (event) => {
  selectedUser.value = event.data
  console.log('Selected user:', event.data)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
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
</style>