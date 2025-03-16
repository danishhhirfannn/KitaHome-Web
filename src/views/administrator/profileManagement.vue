<template>
  <div class="p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#232959]">Profile Management</h1>
      <p class="text-gray-600 mt-2">Manage all user profiles and their verification status</p>
    </div>

    <DataTable 
      :value="users" 
      :paginator="true" 
      :rows="10"
      :loading="loading"
      stripedRows
      class="p-datatable-sm"
    >
      <Column field="fullName" header="Full Name" sortable></Column>
      <Column field="email" header="Email" sortable></Column>
      <Column field="phone" header="Phone"></Column>
      <Column field="residenceID" header="Residence ID" sortable></Column>
      <Column field="unitNumber" header="Unit"></Column>
      <Column header="Roles">
        <template #body="slotProps">
          <div class="flex gap-2">
            <span v-if="slotProps.data.isAdmin" class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
              Admin
            </span>
            <span v-if="slotProps.data.isManagement" class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              Management
            </span>
            <span v-if="slotProps.data.isResident" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              Resident
            </span>
          </div>
        </template>
      </Column>
      <Column header="Status">
        <template #body="slotProps">
          <span v-if="slotProps.data.isVerified" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Verified
          </span>
          <span v-else-if="slotProps.data.isDeclined" class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Declined
          </span>
          <span v-else class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button 
            icon="pi pi-eye" 
            class="p-button-text p-button-sm"
            @click="viewDetails(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/api/supabase'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const users = ref([])
const loading = ref(true)

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

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
  @apply bg-gray-50 text-gray-600 font-medium;
}

.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
  @apply text-gray-700;
}
</style>